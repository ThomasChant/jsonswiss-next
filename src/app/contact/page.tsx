import type { Metadata } from "next";
import { HeaderServer } from "@/components/layout/HeaderServer";
import { Footer } from "@/components/layout/Footer";
import { Mail, MessageSquare, Github, Coffee, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us - JSON Swiss",
  description: "Get in touch with JSON Swiss team. Contact us for support, feedback, feature requests, or any questions about our JSON tools and services.",
  keywords: [
    "contact json swiss",
    "json tools support",
    "customer service",
    "feedback",
    "feature request",
    "help"
  ],
  alternates: {
    canonical: "https://jsonswiss.com/contact"
  }
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <HeaderServer />
      
      <main className="px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-8">
              Contact Us
            </h1>
            
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
                We'd love to hear from you! Whether you have questions, feedback, feature requests, or need support, we're here to help.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {/* Contact Methods */}
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
                    Get in Touch
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1" />
                      <div>
                        <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-1">
                          Email Support
                        </h3>
                        <p className="text-slate-600 dark:text-slate-300 text-sm mb-2">
                          For general inquiries and support
                        </p>
                        <a 
                          href="mailto:support@jsonswiss.com" 
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          support@jsonswiss.com
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <MessageSquare className="w-6 h-6 text-green-600 dark:text-green-400 mt-1" />
                      <div>
                        <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-1">
                          Feature Requests
                        </h3>
                        <p className="text-slate-600 dark:text-slate-300 text-sm mb-2">
                          Suggest new features or improvements
                        </p>
                        <a 
                          href="mailto:features@jsonswiss.com" 
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          features@jsonswiss.com
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <Github className="w-6 h-6 text-slate-600 dark:text-slate-400 mt-1" />
                      <div>
                        <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-1">
                          GitHub Issues
                        </h3>
                        <p className="text-slate-600 dark:text-slate-300 text-sm mb-2">
                          Report bugs or contribute to development
                        </p>
                        <a 
                          href="https://github.com/jsonswiss/jsonswiss" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center space-x-1"
                        >
                          <span>GitHub Repository</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <Coffee className="w-6 h-6 text-orange-600 dark:text-orange-400 mt-1" />
                      <div>
                        <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-1">
                          Support Our Work
                        </h3>
                        <p className="text-slate-600 dark:text-slate-300 text-sm mb-2">
                          Help us keep JSON Swiss free and awesome
                        </p>
                        <a 
                          href="https://buymeacoffee.com/jsonswiss" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center space-x-1"
                        >
                          <span>Buy Me a Coffee</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FAQ */}
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
                    Frequently Asked Questions
                  </h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                        Is JSON Swiss free to use?
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300 text-sm">
                        Yes! JSON Swiss is completely free to use. All our tools are available without any cost or registration required.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                        Is my data secure?
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300 text-sm">
                        Most of our tools process data entirely in your browser, meaning your data never leaves your device. For tools that require server processing, data is processed temporarily and immediately deleted.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                        Can I use JSON Swiss for commercial projects?
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300 text-sm">
                        Absolutely! You can use JSON Swiss for both personal and commercial projects without any restrictions.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                        How can I request a new feature?
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300 text-sm">
                        You can send feature requests to features@jsonswiss.com or create an issue on our GitHub repository. We review all suggestions and prioritize based on community needs.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                        Do you offer API access?
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300 text-sm">
                        Currently, we focus on web-based tools. However, API access is something we're considering for the future. Contact us if you have specific API requirements.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  Response Time
                </h2>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  We strive to respond to all inquiries within 24-48 hours during business days. For urgent issues, please mark your email as "URGENT" in the subject line.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  Community
                </h2>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  Join our growing community of developers who use JSON Swiss daily. Share your experiences, get help from other users, and stay updated on new features:
                </p>
                <ul className="list-disc pl-6 text-slate-600 dark:text-slate-300 mb-4">
                  <li>Follow us on social media for updates and tips</li>
                  <li>Star our GitHub repository to show support</li>
                  <li>Share JSON Swiss with your developer friends</li>
                  <li>Contribute to our open-source projects</li>
                </ul>
              </section>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  💡 Pro Tip
                </h3>
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  Before contacting support, try checking our tool-specific FAQ sections and documentation. Many common questions are answered there!
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}