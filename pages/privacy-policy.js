import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Mail, Lock } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <Head>
        <title>Privacy Policy | VRL Logistics Review Portal</title>
        <meta name="robots" content="noindex" />
      </Head>

      {/* Header */}
      <nav className="bg-white shadow-md sticky top-0 z-50 border-t-4 border-[#FFCC01]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-[#DC2626] font-bold transition-colors">
            <ArrowLeft size={20} />
            Back to Home
          </Link>
          <span className="font-bold text-lg text-gray-900">Privacy Policy</span>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100">
          
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FFF8E1] rounded-full mb-4">
              <ShieldCheck size={32} className="text-[#FFCC01]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Privacy Policy
            </h1>
            <p className="text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="space-y-8 leading-relaxed text-gray-600">
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                1. Introduction
              </h2>
              <p>
                Welcome to the <strong>VRL Logistics Review Portal</strong>. We value your privacy and are committed to protecting your personal data. This policy explains how we collect, use, and safeguard your information when you use our website and login services (Google & Facebook).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                2. Information We Collect
              </h2>
              <p className="mb-2">We collect the following information when you authenticate via third-party providers (Google or Facebook):</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Name:</strong> To display your identity on reviews you submit.</li>
                <li><strong>Email Address:</strong> For unique identification and account management.</li>
                <li><strong>Profile Picture:</strong> To display on your user profile and reviews.</li>
              </ul>
              <p className="mt-2 text-sm bg-gray-50 p-3 rounded border border-gray-200">
                We do <strong>not</strong> post to your social media accounts without your explicit permission.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                3. How We Use Your Data
              </h2>
              <p>The information we collect is used solely for:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Verifying your identity to prevent spam reviews.</li>
                <li>Displaying your name and photo alongside your reviews on our public portal.</li>
                <li>Allowing you to manage your own reviews (edit/delete).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Lock size={18} className="text-[#DC2626]" /> 4. Data Deletion Instructions
              </h2>
              <p>
                According to Facebook Platform rules, we provide a way for you to request the deletion of your data. If you wish to remove your data from our system:
              </p>
              <ol className="list-decimal pl-5 mt-2 space-y-2">
                <li>Send an email to our support team at <a href="mailto:privacy@vrllogistics.co.in" className="text-blue-600 underline">privacy@vrllogistics.co.in</a>.</li>
                <li>Include "Data Deletion Request" in the subject line.</li>
                <li>We will permanently delete your account and associated reviews within 30 days.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                5. Contact Us
              </h2>
              <p className="flex items-center gap-2">
                <Mail size={18} /> 
                For any privacy concerns, please contact us at: 
                <span className="font-bold text-gray-900">info@vrllogistics.co.in</span>
              </p>
            </section>
          </div>

        </div>
        
        <div className="text-center text-gray-400 text-sm mt-8">
          © {new Date().getFullYear()} VRL Logistics Packers and Movers. All rights reserved.
        </div>
      </main>
    </div>
  );
}