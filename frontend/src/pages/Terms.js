import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../LP-components/Navbar";

const Terms = () => (
  <div className="min-h-screen bg-neutral-50">
    <Navbar />
    <main className="pt-24 pb-16 px-4 sm:px-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-neutral-900 mb-6">Terms of Service</h1>
      <div className="prose prose-neutral text-neutral-700 space-y-4 text-sm leading-relaxed">
        <p>
          By using Sturum, you agree to these terms. If you do not agree, do not use the platform.
        </p>
        <h2 className="text-lg font-semibold text-neutral-900 pt-2">Eligibility</h2>
        <p>
          Sturum is for university students. You must provide accurate information at signup and
          keep your credentials secure.
        </p>
        <h2 className="text-lg font-semibold text-neutral-900 pt-2">Your content</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>You are responsible for posts, messages, and materials you upload</li>
          <li>Do not upload content that infringes copyright or breaks the law</li>
          <li>Do not harass others, spam, or impersonate people</li>
          <li>Study materials should be shared responsibly; do not use the platform for cheating</li>
        </ul>
        <h2 className="text-lg font-semibold text-neutral-900 pt-2">Department scope</h2>
        <p>
          Features are scoped to your academic department. Misrepresenting your department or
          level may result in account restriction.
        </p>
        <h2 className="text-lg font-semibold text-neutral-900 pt-2">Service availability</h2>
        <p>
          We provide Sturum as-is during early pilots. We may change or discontinue features with
          notice when possible.
        </p>
        <h2 className="text-lg font-semibold text-neutral-900 pt-2">Limitation of liability</h2>
        <p>
          Sturum is a peer community tool, not an official university system. We are not liable for
          disputes between users or for academic outcomes related to shared materials.
        </p>
        <p className="text-neutral-500 text-xs pt-4">
          Last updated: 2026. Obtain formal legal review before institutional or commercial use.
        </p>
      </div>
      <Link to="/" className="inline-block mt-8 text-primary-600 font-semibold hover:underline">
        ← Back to home
      </Link>
    </main>
  </div>
);

export default Terms;
