const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");
const fs = require("fs");
const path = require("path");
const { UPLOAD_DIR } = require("./upload");

const GRIDFS_PREFIX = "gridfs://";
const BUCKET_NAME = "sturumFiles";

let bucket = null;

const getBucket = () => {
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("Database not connected");
  }
  if (!bucket) {
    bucket = new GridFSBucket(db, { bucketName: BUCKET_NAME });
  }
  return bucket;
};

const isGridFsRef = (fileRef) =>
  Boolean(fileRef && typeof fileRef === "string" && fileRef.startsWith(GRIDFS_PREFIX));

const toGridFsRef = (id) => `${GRIDFS_PREFIX}${id.toString()}`;

const parseGridFsId = (fileRef) => {
  if (!isGridFsRef(fileRef)) return null;
  return new mongoose.Types.ObjectId(fileRef.slice(GRIDFS_PREFIX.length));
};

/** Public file key used in /api/files/:key URLs */
const getFileKeyFromRef = (fileRef) => {
  if (!fileRef) return null;
  if (isGridFsRef(fileRef)) return fileRef.slice(GRIDFS_PREFIX.length);
  return path.basename(fileRef);
};

const refFromFileKey = (fileKey) => {
  if (/^[a-f0-9]{24}$/i.test(fileKey)) return toGridFsRef(fileKey);
  return `/uploads/${fileKey}`;
};

/**
 * Persist multer file (memory storage) to GridFS. Returns gridfs://id reference.
 */
const saveUploadedFile = (file) =>
  new Promise((resolve, reject) => {
    const gfs = getBucket();
    const uploadStream = gfs.openUploadStream(file.originalname || "file", {
      contentType: file.mimetype,
      metadata: { uploadedAt: new Date() },
    });

    uploadStream.on("error", reject);
    uploadStream.on("finish", () => {
      resolve(toGridFsRef(uploadStream.id));
    });

    uploadStream.end(file.buffer);
  });

const deleteFileRef = async (fileRef) => {
  if (!fileRef) return;

  if (isGridFsRef(fileRef)) {
    try {
      await getBucket().delete(parseGridFsId(fileRef));
    } catch (err) {
      if (err.code !== "ENOENT" && err.name !== "MongoRuntimeError") {
        console.error("[fileStorage] GridFS delete failed:", err.message);
      }
    }
    return;
  }

  if (fileRef.startsWith("/uploads/")) {
    const diskPath = path.join(UPLOAD_DIR, path.basename(fileRef));
    if (fs.existsSync(diskPath)) {
      fs.unlinkSync(diskPath);
    }
  }
};

const streamGridFsToResponse = async (fileId, res) => {
  const gfs = getBucket();
  const _id = typeof fileId === "string" ? new mongoose.Types.ObjectId(fileId) : fileId;
  const files = await gfs.find({ _id }).limit(1).toArray();
  if (!files.length) {
    return false;
  }

  const meta = files[0];
  if (meta.contentType) {
    res.setHeader("Content-Type", meta.contentType);
  }
  if (meta.length) {
    res.setHeader("Content-Length", meta.length);
  }

  return new Promise((resolve, reject) => {
    const downloadStream = gfs.openDownloadStream(_id);
    downloadStream.on("error", (err) => {
      if (err.code === "ENOENT") resolve(false);
      else reject(err);
    });
    downloadStream.on("end", () => resolve(true));
    downloadStream.pipe(res);
  });
};

const sendLegacyDiskFile = (fileKey, res) => {
  const absolutePath = path.join(UPLOAD_DIR, fileKey);
  if (!fs.existsSync(absolutePath)) {
    return false;
  }
  res.sendFile(absolutePath);
  return true;
};

/** Express middleware: after multer, sets req.fileRef (single) */
const persistUpload = async (req, res, next) => {
  try {
    if (req.file) {
      req.fileRef = await saveUploadedFile(req.file);
    }
    next();
  } catch (error) {
    console.error("[fileStorage] persist upload failed:", error);
    res.status(500).json({ error: "Failed to store uploaded file" });
  }
};

/** After multer.array — sets req.fileRefs */
const persistUploads = async (req, res, next) => {
  try {
    const files = req.files?.length ? req.files : req.file ? [req.file] : [];
    if (files.length) {
      req.fileRefs = await Promise.all(files.map((f) => saveUploadedFile(f)));
      req.fileRef = req.fileRefs[0];
    } else {
      req.fileRefs = [];
    }
    next();
  } catch (error) {
    console.error("[fileStorage] persist uploads failed:", error);
    res.status(500).json({ error: "Failed to store uploaded files" });
  }
};

module.exports = {
  GRIDFS_PREFIX,
  isGridFsRef,
  getFileKeyFromRef,
  refFromFileKey,
  saveUploadedFile,
  deleteFileRef,
  streamGridFsToResponse,
  sendLegacyDiskFile,
  persistUpload,
  persistUploads,
};
