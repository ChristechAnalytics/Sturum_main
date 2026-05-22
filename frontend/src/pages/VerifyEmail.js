import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../LP-components/Navbar";
import API_URL from "../config";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing verification link. Open the link from your email.");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/users/verify-email?token=${encodeURIComponent(token)}`
        );
        const data = await res.json();

        if (!res.ok) {
          setStatus("error");
          setMessage(data.error || "Verification failed.");
          return;
        }

        setStatus("success");
        setMessage(data.message || "Email verified successfully.");
      } catch {
        setStatus("error");
        setMessage("Could not reach the server. Try again later.");
      }
    };

    verify();
  }, [token]);

  return (
    <div>
      <Navbar currentPage="login" />
      <div className="pt-[4.5rem] flex justify-center items-center min-h-[calc(100vh-80px)] px-4">
        <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 border border-gray-200 text-center">
          {status === "loading" && (
            <>
              <h1 className="text-2xl font-bold text-[#424242] mb-3">Verifying your email</h1>
              <p className="text-neutral-600">Please wait…</p>
            </>
          )}
          {status === "success" && (
            <>
              <h1 className="text-2xl font-bold text-green-700 mb-3">Email verified</h1>
              <p className="text-neutral-600 mb-6">{message}</p>
              <Link
                to="/login"
                className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg"
              >
                Log in
              </Link>
            </>
          )}
          {status === "error" && (
            <>
              <h1 className="text-2xl font-bold text-red-700 mb-3">Verification failed</h1>
              <p className="text-neutral-600 mb-6">{message}</p>
              <Link
                to="/signup"
                className="inline-block text-primary-600 font-semibold hover:underline"
              >
                Back to sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
