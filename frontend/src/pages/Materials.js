import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import Header from "../DEPT-components/Header";
import NavbarMP from "../DEPT-components/NavbarMP";
import MaterialCard from "../DEPT-components/MateralCard";
import { useAuthContext } from "../hooks/useAuthContext";
import { FaTimes } from "react-icons/fa";
import API_URL from "../config";

Modal.setAppElement("#root");

const Materials = () => {
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const { user } = useAuthContext();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    file: null,
  });

  // Fetch materials from the API
  const fetchMaterials = async () => {
    try {
      if (!user || !user.token) {
        throw new Error("User is not authenticated");
      }

      const response = await fetch(`${API_URL}/api/materials`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch materials: ${response.statusText}`);
      }

      const data = await response.json();
      setMaterials(data);
      filterMaterials(data, selectedCategory);
    } catch (error) {
      console.error("Error fetching materials:", error.message);
    }
  };

  // Filter materials based on selected category
  const filterMaterials = (materials, category) => {
    if (category === "") {
      setFilteredMaterials(materials);
    } else {
      const filtered = materials.filter((material) =>
        material.category.toLowerCase().includes(category.toLowerCase())
      );
      setFilteredMaterials(filtered);
    }
  };

  // Handle category change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    filterMaterials(materials, category);
  };

  // Handle search
  const handleSearch = (query) => {
    const filtered = materials.filter((material) =>
      material.title.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredMaterials(filtered);
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      setFormData({ ...formData, file: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleDelete = async (materialId) => {
    if (!window.confirm("Delete this material?")) return;
    try {
      const response = await fetch(`${API_URL}/api/materials/${materialId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Delete failed");
      }
      const updated = materials.filter((m) => m._id !== materialId);
      setMaterials(updated);
      filterMaterials(updated, selectedCategory);
    } catch (error) {
      console.error("Error deleting material:", error.message);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    try {
      if (!user || !user.token) {
        throw new Error("User is not authenticated");
      }

      const uploadData = new FormData();
      uploadData.append("title", formData.title);
      uploadData.append("category", formData.category);
      uploadData.append("file", formData.file);

      console.log("FormData contents:");
      for (let [key, value] of uploadData.entries()) {
        console.log(`${key}: ${value}`);
      }

      const response = await fetch(`${API_URL}/api/materials`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        body: uploadData,
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response data:", errorData);
        throw new Error(errorData.message || "Error uploading material");
      }

      const newMaterial = await response.json();
      console.log("Uploaded material:", newMaterial);

      const updatedMaterials = [newMaterial, ...materials];
      setMaterials(updatedMaterials);
      filterMaterials(updatedMaterials, selectedCategory);
      setModalIsOpen(false); // Close modal after upload
    } catch (error) {
      console.error("Error uploading material:", error.message);
    }
  };

  useEffect(() => {
    fetchMaterials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Toggle body scroll lock based on modal state
  useEffect(() => {
    if (modalIsOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [modalIsOpen]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/20 to-neutral-50">
      <Header />
      <NavbarMP onSearch={handleSearch} />
      <div className="pt-[7rem] sm:pt-[7.125rem] md:pt-[8rem] px-4 sm:px-6 mx-auto max-w-[700px] pb-8">
        {/* Upload Material Button */}
        <div className="my-5">
          <button
            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
            onClick={() => setModalIsOpen(true)}
          >
            + Upload Material
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex justify-between mb-5 overflow-x-auto pb-2 scrollbar-hide">
          <button
            className={`mr-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 whitespace-nowrap ${
              selectedCategory === ""
                ? "bg-primary-600 text-white shadow-md"
                : "bg-neutral-200 hover:bg-neutral-300 text-neutral-700"
            }`}
            onClick={() => handleCategoryChange("")}
          >
            All
          </button>
          <button
            className={`mr-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 whitespace-nowrap ${
              selectedCategory === "Past Questions"
                ? "bg-primary-600 text-white shadow-md"
                : "bg-neutral-200 hover:bg-neutral-300 text-neutral-700"
            }`}
            onClick={() => handleCategoryChange("Past Questions")}
          >
            Past Questions
          </button>
          <button
            className={`mr-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 whitespace-nowrap ${
              selectedCategory === "Handouts"
                ? "bg-primary-600 text-white shadow-md"
                : "bg-neutral-200 hover:bg-neutral-300 text-neutral-700"
            }`}
            onClick={() => handleCategoryChange("Handouts")}
          >
            Handouts
          </button>
          <button
            className={`mr-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 whitespace-nowrap ${
              selectedCategory === "Books"
                ? "bg-primary-600 text-white shadow-md"
                : "bg-neutral-200 hover:bg-neutral-300 text-neutral-700"
            }`}
            onClick={() => handleCategoryChange("Books")}
          >
            Books
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 whitespace-nowrap ${
              selectedCategory === "Pictures"
                ? "bg-primary-600 text-white shadow-md"
                : "bg-neutral-200 hover:bg-neutral-300 text-neutral-700"
            }`}
            onClick={() => handleCategoryChange("Pictures")}
          >
            Pictures
          </button>
        </div>

        {/* Material Cards */}
        {filteredMaterials.map((material) => (
          <MaterialCard
            key={material._id}
            _id={material._id}
            title={material.title}
            fileUrl={material.fileUrl}
            category={material.category}
            uploadedAt={material.uploadedAt}
            author={material.authorId?.name || material.authorId}
            authorId={material.authorId?._id || material.authorId}
            onDelete={handleDelete}
          />
        ))}

        {/* Modal for Upload Material Form */}
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={() => setModalIsOpen(false)}
          className="fixed inset-0 flex items-center justify-center z-50"
          overlayClassName="fixed inset-0 bg-black bg-opacity-75 z-40"
        >
          <div
            className="w-full mx-auto max-w-lg p-6 bg-white rounded-2xl shadow-2xl border-2 border-neutral-200"
            onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing the modal
          >
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold text-neutral-800">Upload Material</h2>
              <button
                onClick={() => setModalIsOpen(false)}
                className="text-[20px] cursor-pointer hover:text-red-500 transition-colors p-2 rounded-full hover:bg-neutral-100"
                aria-label="Close modal"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleUpload}>
              <div className="mb-4">
                <label className="block text-neutral-700 font-semibold mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                  placeholder="Enter material title"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-neutral-700 font-semibold mb-2">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Past Questions">Past Questions</option>
                  <option value="Handouts">Handouts</option>
                  <option value="Books">Books</option>
                  <option value="Pictures">Pictures</option>
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-neutral-700 font-semibold mb-2">File</label>
                <input
                  type="file"
                  name="file"
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg py-3 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Upload Material
              </button>
            </form>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Materials;
