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
      <div className="min-h-screen bg-white flex flex-col">
        {/* Header */}
        <HeaderServer />
      
        {/* Main Content */}
        <main className="flex-1 px-3 md:px-4 py-12">
          <div className="max-w-7xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h1 className="text-xl md:text-4xl font-bold text-slate-900 mb-6">
                Every tool you need to work with JSONs in one place
              </h1>
              <p className="text-lg text-slate-600 mb-8 max-w-4xl mx-auto leading-relaxed">
                Every tool you need to use JSONs, at your fingertips. All are 100% FREE and easy to use! Format, validate, convert, compare and generate JSONs with just a few clicks.
              </p>
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