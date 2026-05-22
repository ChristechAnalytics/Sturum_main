import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../LP-components/Navbar";

const Privacy = () => (
  <div className="min-h-screen bg-neutral-50">
    <Navbar />
    <main className="pt-24 pb-16 px-4 sm:px-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-neutral-900 mb-6">Privacy Policy</h1>
      <div className="prose prose-neutral text-neutral-700 space-y-4 text-sm leading-relaxed">
        <p>
          Sturum (&quot;we&quot;, &quot;the platform&quot;) respects your privacy. This policy describes what we
          collect and how we use it when you use our student community platform.
        </p>
        <h2 className="text-lg font-semibold text-neutral-900 pt-2">Information we collect</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Account details: name, email, department, academic level, contact number, profile photo</li>
          <li>Content you post: feed posts, comments, messages to connections, uploaded materials</li>
          <li>Technical data: authentication tokens, usage needed to operate the service</li>
        </ul>
        <h2 className="text-lg font-semibold text-neutral-900 pt-2">How we use information</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>To provide department-scoped features (feed, materials, messaging, connections)</li>
          <li>To send verification and service-related emails</li>
          <li>To improve security and prevent abuse</li>
        </ul>
        <h2 className="text-lg font-semibold text-neutral-900 pt-2">Sharing</h2>
        <p>
          We do not sell your personal data. Content you share in your department may be visible to
          other students in the same department, as designed by the product. We use service
          providers (e.g. hosting, email) only to run the platform.
        </p>
        <h2 className="text-lg font-semibold text-neutral-900 pt-2">Your choices</h2>
        <p>
          You can update your profile in Settings. You may request account deletion by contacting
          us. Email verification is required for account security.
        </p>
        <p className="text-neutral-500 text-xs pt-4">
          Last updated: 2026. This is a summary for early pilots; update with legal review before
          wide public launch.
        </p>
      </div>
      <Link to="/" className="inline-block mt-8 text-primary-600 font-semibold hover:underline">
        ← Back to home
      </Link>
    </main>
  </div>
);

export default Privacy;
