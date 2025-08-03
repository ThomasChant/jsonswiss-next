import { HelpCircle } from "lucide-react";

interface FAQ {
  question: string;
  answer: string;
}

interface FAQServerProps {
  faqItems: FAQ[];
  className?: string;
}

// 服务器端 FAQ 组件 - 所有问题默认展开，无需客户端交互
export function FAQServer({ faqItems, className }: FAQServerProps) {
  if (faqItems.length === 0) return null;

  return (
    <div className={`px-6 py-8 bg-white/50 dark:bg-slate-900/50 ${className || ''}`}>
      <div className="max-w-4xl mx-auto">
        <div className="mt-6 flex items-center justify-center space-x-2 mb-6 text-center">
          <HelpCircle className="w-6 h-6 text-blue-500" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Frequently Asked Questions
          </h2>
        </div>
        
        <div className="space-y-4">
          {faqItems.map((faq, index) => (
            <div key={index} className="border border-slate-200 dark:border-slate-700 rounded-lg">
              {/* 问题标题 - 始终可见 */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50">
                <h3 className="font-medium text-slate-900 dark:text-slate-100">
                  {faq.question}
                </h3>
              </div>
              
              {/* 答案内容 - 始终展开 */}
              <div className="px-4 pb-4 pt-2 text-slate-600 dark:text-slate-400">
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}