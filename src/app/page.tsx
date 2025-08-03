import { HeaderServer } from "@/components/layout/HeaderServer";
import { Footer } from "@/components/layout/Footer";
import { FeatureCards } from "@/components/home/FeatureCards";
import { StructuredData, homePageStructuredData, organizationStructuredData } from "@/components/seo/StructuredData";
import { 
  Zap, 
  Shield, 
  Sparkles
} from "lucide-react";

export default function Home() {
  return (
    <>
      <StructuredData data={homePageStructuredData} />
      <StructuredData data={organizationStructuredData} />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex flex-col">
        {/* Header */}
        <HeaderServer />
      
      {/* Main Content */}
      <main className="flex-1 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="mb-8">
              <h1 className="text-4xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-6">
                JSON Swiss
              </h1>
              <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-8 max-w-3xl mx-auto">
                Professional JSON processing toolkit with formatting, validation, conversion, code generation, and more
              </p>
            </div>

            {/* Features Highlight */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="flex flex-col items-center">
                <Zap className="w-8 h-8 text-yellow-500 mb-3" />
                <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Lightning Fast
                </h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Real-time processing with instant feedback for smooth user experience
                </p>
              </div>
              
              <div className="flex flex-col items-center">
                <Shield className="w-8 h-8 text-green-500 mb-3" />
                <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Secure & Private
                </h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  All processing happens locally in your browser, protecting your data privacy
                </p>
              </div>
              
              <div className="flex flex-col items-center">
                <Sparkles className="w-8 h-8 text-blue-500 mb-3" />
                <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Feature Rich
                </h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Comprehensive toolkit covering all aspects of JSON processing needs
                </p>
              </div>
            </div>
          </div>

          {/* Feature Cards */}
          <FeatureCards />
        </div>
      </main>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}