import type { Metadata } from "next";
import { HeaderServer } from "@/components/layout/HeaderServer";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Terms of Service - JSON Swiss",
  description: "Terms of Service for JSON Swiss - Learn about the terms and conditions for using our JSON tools and services.",
  keywords: [
    "terms of service",
    "terms and conditions",
    "json swiss terms",
    "user agreement",
    "service agreement"
  ],
  alternates: {
    canonical: "https://jsonswiss.com/terms"
  }
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <HeaderServer />
      
      <main className="px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-8">
              Terms of Service
            </h1>
            
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
                Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  Agreement to Terms
                </h2>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  By accessing and using JSON Swiss ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  Description of Service
                </h2>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  JSON Swiss provides online tools for JSON processing, including but not limited to:
                </p>
                <ul className="list-disc pl-6 text-slate-600 dark:text-slate-300 mb-4">
                  <li>JSON formatting and validation</li>
                  <li>JSON to code generation in various programming languages</li>
                  <li>JSON conversion tools (CSV, XML, YAML, etc.)</li>
                  <li>JSON comparison and diff tools</li>
                  <li>JSON schema generation and validation</li>
                  <li>JSON repair and error correction</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  Acceptable Use
                </h2>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to:
                </p>
                <ul className="list-disc pl-6 text-slate-600 dark:text-slate-300 mb-4">
                  <li>Use the Service for any illegal or unauthorized purpose</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Interfere with or disrupt the Service or servers</li>
                  <li>Upload malicious code or harmful content</li>
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe upon the rights of others</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  User Content and Data
                </h2>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  <strong>Your Data:</strong> You retain all rights to any data you input into our tools. Most processing occurs client-side in your browser, meaning your data never leaves your device.
                </p>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  <strong>Responsibility:</strong> You are solely responsible for the content and data you process through our Service. Ensure you have the right to process any data you submit.
                </p>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  <strong>Sensitive Data:</strong> Do not input sensitive, confidential, or personally identifiable information unless necessary for your specific use case.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  Intellectual Property
                </h2>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  The Service and its original content, features, and functionality are and will remain the exclusive property of JSON Swiss and its licensors. The Service is protected by copyright, trademark, and other laws.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  Service Availability
                </h2>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  We strive to maintain high availability of our Service, but we do not guarantee uninterrupted access. The Service may be temporarily unavailable due to:
                </p>
                <ul className="list-disc pl-6 text-slate-600 dark:text-slate-300 mb-4">
                  <li>Scheduled maintenance</li>
                  <li>Technical issues or server problems</li>
                  <li>Force majeure events</li>
                  <li>Third-party service dependencies</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  Disclaimer of Warranties
                </h2>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  The Service is provided on an "AS IS" and "AS AVAILABLE" basis. JSON Swiss makes no representations or warranties of any kind, express or implied, as to the operation of the Service or the information, content, materials, or products included therein.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  Limitation of Liability
                </h2>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  JSON Swiss will not be liable for any damages of any kind arising from the use of this Service, including but not limited to direct, indirect, incidental, punitive, and consequential damages.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  Privacy Policy
                </h2>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  Changes to Terms
                </h2>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  We reserve the right to modify these terms at any time. We will notify users of any changes by posting the new Terms of Service on this page and updating the "Last updated" date.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  Termination
                </h2>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  We may terminate or suspend your access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  Governing Law
                </h2>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  These Terms shall be interpreted and governed by the laws of the jurisdiction in which JSON Swiss operates, without regard to its conflict of law provisions.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  Contact Information
                </h2>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  If you have any questions about these Terms of Service, please contact us:
                </p>
                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                  <p className="text-slate-700 dark:text-slate-300">
                    Email: legal@jsonswiss.com<br />
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