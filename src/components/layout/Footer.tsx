"use client";

import Link from "next/link";
import { Github, Heart, Coffee, ExternalLink } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700">
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* About */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">J</span>
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">JSON Swiss</h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                A comprehensive JSON toolkit for developers. Format, validate, repair, and transform JSON with AI-powered features.
              </p>
             
            </div>

            {/* Tools */}
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Tools</h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><Link href="/formatter" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">JSON Formatter</Link></li>
                <li><Link href="/validator" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">JSON Validator</Link></li>
                <li><Link href="/repair" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">JSON Repair</Link></li>
                <li><Link href="/schema" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Schema Generator</Link></li>
              </ul>
            </div>

            {/* Converters */}
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Converters</h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><Link href="/converter/csv-to-json" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">CSV to JSON</Link></li>
                <li><Link href="/converter/xml-to-json" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">XML to JSON</Link></li>
                <li><Link href="/converter/yaml-to-json" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">YAML to JSON</Link></li>
                <li><Link href="/converter/excel-to-json" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Excel to JSON</Link></li>
                <li><Link href="/converter/json-to-csv" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">JSON to CSV</Link></li>
                <li><Link href="/converter/json-to-excel" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">JSON to Excel</Link></li>
              </ul>
            </div>

            {/* Generators */}
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Code Generators</h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><Link href="/generator/javascript" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">JavaScript</Link></li>
                <li><Link href="/generator/typescript" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">TypeScript</Link></li>
                <li><Link href="/generator/python" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Python</Link></li>
                <li>
                  <Link 
                    href="/generator" 
                    className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors inline-flex items-center space-x-1"
                  >
                    <span>View All Languages</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                <span>© {currentYear} JSON Swiss.</span>
                <span>Made with</span>
                <Heart className="w-4 h-4 text-red-500 fill-current" />
                <span>for developers</span>
              </div>
              
              <div className="flex items-center space-x-6 mt-4 md:mt-0">
                <Link href="/changelog" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Changelog</Link>
                <Link href="/privacy" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Terms of Service</Link>
                <Link href="/contact" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Contact</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}