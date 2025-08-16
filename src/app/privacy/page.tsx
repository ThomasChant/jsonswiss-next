import type { Metadata } from "next";
import { HeaderServer } from "@/components/layout/HeaderServer";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy - JSON Swiss",
  description: "Privacy Policy for JSON Swiss - Learn how we collect, use, and protect your data when using our JSON tools and services.",
  keywords: [
    "privacy policy",
    "data protection",
    "json swiss privacy",
    "user data",
    "privacy rights"
  ],
  alternates: {
    canonical: "https://jsonswiss.com/privacy"
  }
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <HeaderServer />
      
      <main className="px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-8">
              Privacy Policy
            </h1>
            
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
                Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  Introduction
                </h2>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  JSON Swiss ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our JSON processing tools.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  Information We Collect
                </h2>
                <h3 className="text-xl font-medium text-slate-800 dark:text-slate-200 mb-3">
                  Information You Provide
                </h3>
                <ul className="list-disc pl-6 text-slate-600 dark:text-slate-300 mb-4">
                  <li>JSON data you input into our tools for processing</li>
                  <li>Contact information when you reach out to us</li>
                  <li>Feedback and suggestions you provide</li>
                </ul>
                
                <h3 className="text-xl font-medium text-slate-800 dark:text-slate-200 mb-3">
                  Automatically Collected Information
                </h3>
                <ul className="list-disc pl-6 text-slate-600 dark:text-slate-300 mb-4">
                  <li>Usage data and analytics</li>
                  <li>Device information and browser type</li>
                  <li>IP address and location data</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  How We Use Your Information
                </h2>
                <ul className="list-disc pl-6 text-slate-600 dark:text-slate-300 mb-4">
                  <li>To provide and maintain our JSON processing services</li>
                  <li>To improve our tools and user experience</li>
                  <li>To analyze usage patterns and optimize performance</li>
                  <li>To respond to your inquiries and provide support</li>
                  <li>To detect and prevent fraud or abuse</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  Data Processing and Storage
                </h2>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  <strong>Client-Side Processing:</strong> Most of our JSON tools process your data entirely in your browser. This means your JSON data never leaves your device and is not transmitted to our servers.
                </p>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  <strong>Temporary Storage:</strong> For certain advanced features, we may temporarily process data on our servers. Such data is immediately deleted after processing and is never stored permanently.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  Data Sharing and Disclosure
                </h2>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  We do not sell, trade, or otherwise transfer your personal information to third parties, except:
                </p>
                <ul className="list-disc pl-6 text-slate-600 dark:text-slate-300 mb-4">
                  <li>With your explicit consent</li>
                  <li>To comply with legal obligations</li>
                  <li>To protect our rights and safety</li>
                  <li>With trusted service providers who assist in operating our website</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  Your Rights and Choices
                </h2>
                <ul className="list-disc pl-6 text-slate-600 dark:text-slate-300 mb-4">
                  <li>Access and update your personal information</li>
                  <li>Request deletion of your data</li>
                  <li>Opt-out of certain data collection</li>
                  <li>Control cookie preferences</li>
                  <li>Request data portability</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  Security Measures
                </h2>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  We implement appropriate technical and organizational security measures to protect your information against unauthorized access, alteration, disclosure, or destruction.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  Changes to This Policy
                </h2>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  Contact Us
                </h2>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  If you have any questions about this Privacy Policy, please contact us at:
                </p>
                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                  <p className="text-slate-700 dark:text-slate-300">
                    Email: support@jsonswiss.com<br />
                    Website: <a href="https://jsonswiss.com/contact" className="text-blue-600 dark:text-blue-400 hover:underline">jsonswiss.com/contact</a>
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}