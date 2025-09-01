import type { Metadata } from "next";
import { HeaderServer } from "@/components/layout/HeaderServer";
import { Footer } from "@/components/layout/Footer";
import { Clock, GitCommit, Tag, User, Calendar } from "lucide-react";

export const metadata: Metadata = {
  title: "Changelog - JSON Swiss",
  description: "Stay updated with the latest features, improvements, and bug fixes in JSON Swiss. View our complete changelog and release history.",
  keywords: [
    "changelog",
    "release notes",
    "updates",
    "json swiss updates",
    "new features",
    "bug fixes",
    "improvements"
  ],
  alternates: {
    canonical: "https://jsonswiss.com/changelog"
  }
};

// Changelog entries - based on actual Git commit history
const changelogEntries = [
  {
    version: "v2.3.0",
    date: "2025-09-01",
    type: "feature",
    title: "Date Type Support and UI Enhancements",
    description: "Added comprehensive date type support with visual styling and improved table functionality with clipboard operations.",
    changes: [
      "Added color styling and label support for date data types in table headers",
      "Implemented copy JSON data to clipboard functionality for table operations",
      "Added empty state component and improved JSON editor import functionality",
      "Enhanced changelog page with complete feature documentation",
      "Fixed TypeScript type errors for complete DataType union coverage"
    ],
    author: "Development Team",
    commit: "6ca13ab"
  },
  {
    version: "v2.2.1",
    date: "2025-08-28",
    type: "feature",
    title: "Table Copy Functionality",
    description: "Enhanced table operations with clipboard integration for better data management.",
    changes: [
      "Added copy JSON data to clipboard functionality for table components",
      "Improved user experience with instant data copying capabilities",
      "Enhanced table interaction patterns for better productivity"
    ],
    author: "Development Team",
    commit: "a29f16b"
  },
  {
    version: "v2.2.0",
    date: "2025-08-25",
    type: "feature",
    title: "Enhanced Table Filtering System",
    description: "Implemented comprehensive filtering system for table view with support for multiple data types including boolean, numeric, string, and date filters.",
    changes: [
      "Added enhanced table filtering functionality with comprehensive data type support",
      "Fixed data handling logic for null and undefined values in table components",
      "Resolved row number column display issues with primitive data types",
      "Optimized layout by removing default titles and descriptions",
      "Fixed JSON formatter editor content update issues",
      "Unified dropdown menu item spacing and hover styles",
      "Added icons to column operation menu items for better UX",
      "Fixed table sorting button display issues for object array types",
      "Added column operation support for inserting and deleting columns",
      "Converted table component hint messages from Chinese to English"
    ],
    author: "Development Team",
    commit: "1982727"
  },
  {
    version: "v2.1.0",
    date: "2025-08-19",
    type: "feature",
    title: "Advanced Table Operations",
    description: "Enhanced table functionality with improved data handling and user interface optimizations.",
    changes: [
      "Fixed data handling logic for null and undefined values in table components",
      "Resolved row number column display issues with primitive data types",
      "Added drag and drop sorting functionality for columns and rows",
      "Enhanced table editor with improved data update logic",
      "Improved filter UI with better user experience and responsiveness"
    ],
    author: "Development Team",
    commit: "6c07e51"
  },
  {
    version: "v2.0.5",
    date: "2025-08-18",
    type: "improvement",
    title: "UI Internationalization Updates",
    description: "Updated all table filtering components interface text from Chinese to English for better international accessibility.",
    changes: [
      "Optimized layout by removing default titles and descriptions",
      "Fixed JSON formatter editor content update issues",
      "Unified dropdown menu item spacing and hover styles",
      "Added icons to column operation menu items for better UX",
      "Improved accessibility with consistent English terminology"
    ],
    author: "Development Team",
    commit: "88c2a79"
  },
  {
    version: "v2.0.4",
    date: "2025-08-17",
    type: "fix",
    title: "Table Operations and Sorting Enhancements",
    description: "Enhanced table functionality with improved sorting and column operations.",
    changes: [
      "Fixed table sorting button display issues for object array types",
      "Added column operation support for inserting and deleting columns",
      "Converted table component hint messages from Chinese to English",
      "Added drag and drop sorting functionality for columns and rows"
    ],
    author: "Development Team",
    commit: "9b08dd2"
  },
  {
    version: "v2.0.3",
    date: "2025-08-16",
    type: "feature",
    title: "Advanced Data Type Filtering",
    description: "Introduced specialized filtering components for different data types with enhanced user experience.",
    changes: [
      "Added JSON table editor test cases and optimized data update logic",
      "Fixed duplicate changelog redirect rules",
      "Updated privacy page contact email and added URL redirect rules",
      "Fixed table styles and z-index issues",
      "Added SingleObjectTable component export"
    ],
    author: "Development Team",
    commit: "90f6778"
  },
  {
    version: "v2.0.2",
    date: "2025-08-16",
    type: "improvement",
    title: "Performance Optimizations",
    description: "Improved application performance and user experience across all tools.",
    changes: [
      "Removed ArrayTable component and cleaned up related exports",
      "Added page SEO metadata and canonical links",
      "Added border styles to table columns for enhanced visual separation",
      "Optimized component structure and performance",
      "Enhanced caching mechanisms for better responsiveness"
    ],
    author: "Development Team",
    commit: "7b216d5"
  },
  {
    version: "v2.0.1",
    date: "2025-08-16",
    type: "fix",
    title: "Bug Fixes and Stability Improvements",
    description: "Resolved various issues and improved overall application stability.",
    changes: [
      "Added page SEO metadata and canonical links",
      "Added border styles to table columns for enhanced visual separation",
      "Improved component organization and exports",
      "Enhanced user interface consistency",
      "Optimized application structure"
    ],
    author: "Development Team",
    commit: "6082402"
  },
  {
    version: "v2.0.0",
    date: "2025-08-16",
    type: "major",
    title: "Major Release - Enhanced JSON Tools Suite",
    description: "Complete redesign with new features, improved performance, and modern UI.",
    changes: [
      "Added page SEO metadata and canonical links for better search visibility",
      "Enhanced table columns with border styles for improved visual separation",
      "Implemented comprehensive component organization and exports",
      "Added modern user interface with consistent design system",
      "Enhanced accessibility and user experience improvements",
      "Optimized application structure and performance",
      "Improved code organization and maintainability"
    ],
    author: "Development Team",
    commit: "22efde4"
  }
];

function getTypeIcon(type: string) {
  switch (type) {
    case 'feature':
      return <Tag className="w-4 h-4 text-green-500" />;
    case 'improvement':
      return <Clock className="w-4 h-4 text-blue-500" />;
    case 'fix':
      return <GitCommit className="w-4 h-4 text-orange-500" />;
    case 'major':
      return <Tag className="w-4 h-4 text-purple-500" />;
    default:
      return <GitCommit className="w-4 h-4 text-gray-500" />;
  }
}

function getTypeBadge(type: string) {
  const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  
  switch (type) {
    case 'feature':
      return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
    case 'improvement':
      return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`;
    case 'fix':
      return `${baseClasses} bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200`;
    case 'major':
      return `${baseClasses} bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200`;
  }
}

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <HeaderServer />
      
      <main className="pt-16">
        <div className="px-6 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                Changelog
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Stay updated with the latest features, improvements, and bug fixes in JSON Swiss. 
                Here's what we've been working on to make your JSON experience better.
              </p>
            </div>

            {/* Changelog Timeline */}
            <div className="space-y-8">
              {changelogEntries.map((entry, index) => (
                <div key={entry.version} className="relative">
                  {/* Timeline line */}
                  {index < changelogEntries.length - 1 && (
                    <div className="absolute left-6 top-16 w-0.5 h-full bg-slate-200 dark:bg-slate-700 -z-10" />
                  )}
                  
                  {/* Entry card */}
                  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full">
                          {getTypeIcon(entry.type)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                              {entry.version}
                            </h2>
                            <span className={getTypeBadge(entry.type)}>
                              {entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}
                            </span>
                          </div>
                          <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">
                            {entry.title}
                          </h3>
                        </div>
                      </div>
                      
                      <div className="text-right text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center space-x-1 mb-1">
                          <Calendar className="w-4 h-4" />
                          <span>{entry.date}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>{entry.author}</span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      {entry.description}
                    </p>

                    {/* Changes list */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                        Changes:
                      </h4>
                      <ul className="space-y-1">
                        {entry.changes.map((change, changeIndex) => (
                          <li key={changeIndex} className="flex items-start space-x-2 text-sm text-slate-600 dark:text-slate-400">
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0" />
                            <span>{change}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Commit info */}
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
                        <GitCommit className="w-3 h-3" />
                        <span>Commit: {entry.commit}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer note */}
            <div className="mt-12 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                For more detailed information about each release, visit our{" "}
                <a 
                  href="https://github.com/jsonswiss/jsonswiss" 
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub repository
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}