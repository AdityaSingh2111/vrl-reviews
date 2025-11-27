import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, FileText, Scale, AlertCircle } from 'lucide-react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <Head>
        <title>Terms of Service | VRL Logistics Review Portal</title>
        <meta name="robots" content="noindex" />
      </Head>

      {/* Header */}
      <nav className="bg-white shadow-md sticky top-0 z-50 border-t-4 border-[#FFCC01]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-[#DC2626] font-bold transition-colors">
            <ArrowLeft size={20} />
            Back to Home
          </Link>
          <span className="font-bold text-lg text-gray-900">Terms of Service</span>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100">
          
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FFF8E1] rounded-full mb-4">
              <FileText size={32} className="text-[#FFCC01]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Terms of Service
            </h1>
            <p className="text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="space-y-8 leading-relaxed text-gray-600">
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing or using the <strong>VRL Logistics Review Portal</strong>, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                2. User Conduct & Reviews
              </h2>
              <p className="mb-2">We encourage open and honest feedback. However, by posting a review, you agree that:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Your review is based on a genuine experience with VRL Logistics.</li>
                <li>You will not post content that is false, misleading, defamatory, or abusive.</li>
                <li>You will not use hate speech or profanity.</li>
                <li>You will not post private information of individuals (e.g., phone numbers of drivers) without consent.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                3. Content Ownership
              </h2>
              <p>
                You retain ownership of the content you submit. However, by posting a review, you grant us a non-exclusive, royalty-free license to use, display, reproduce, and distribute your content on our platform and marketing materials.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Scale size={18} className="text-[#DC2626]" /> 4. Verification & Moderation
              </h2>
              <p>
                We reserve the right to verify reviews using Consignment Numbers (GCN) and other methods. We may remove or flag reviews that violate these terms or appear to be fraudulent, but we are not obligated to monitor all content.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                5. Limitation of Liability
              </h2>
              <p>
                This portal is provided "as is". We make no warranties regarding the accuracy or reliability of user-generated content. We are not liable for any damages arising from your use of this site or reliance on any reviews found here.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                6. Termination
              </h2>
              <p>
                We reserve the right to suspend or terminate your account and access to the service at our sole discretion, without notice, for conduct that we believe violates these Terms.
              </p>
            </section>

            <div className="mt-8 pt-8 border-t border-gray-100 flex items-start gap-3">
               <AlertCircle size={24} className="text-[#FFCC01] flex-shrink-0" />
               <p className="text-sm text-gray-500">
                 If you have any questions regarding these Terms of Service, please contact us at <span className="font-bold text-gray-900">info@vrllogistics.co.in</span>.
               </p>
            </div>
          </div>

        </div>
        
        <div className="text-center text-gray-400 text-sm mt-8">
          © {new Date().getFullYear()} VRL Logistics Packers and Movers. All rights reserved.
        </div>
      </main>
    </div>
  );
}