import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | JobTracker',
  description: 'Privacy Policy for JobTracker Chrome Extension - Learn how we protect your data',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-lg p-8 md:p-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Privacy Policy for JobTracker Extension
        </h1>
        
        <p className="text-sm text-gray-600 mb-8">
          <strong>Last Updated:</strong> January 19, 2025
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Introduction</h2>
          <p className="text-gray-700 leading-relaxed">
            JobTracker ("we", "our", or "us") is committed to protecting your privacy. 
            This Privacy Policy explains how we collect, use, and safeguard your information 
            when you use our Chrome extension.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">1. Account Information</h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li>Email address (for account creation and login)</li>
            <li>Password (encrypted and securely stored)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">2. Job Application Data</h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li>Company names</li>
            <li>Job titles</li>
            <li>Job locations</li>
            <li>Job descriptions</li>
            <li>Job URLs</li>
            <li>Application dates</li>
            <li>Platform (LinkedIn or Naukri)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">3. Technical Information</h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li>Extension version</li>
            <li>Browser type</li>
            <li>Error logs (for debugging purposes)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
          <p className="text-gray-700 mb-3">We use the collected information to:</p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li>Provide and maintain the JobTracker service</li>
            <li>Track and organize your job applications</li>
            <li>Sync data across your devices</li>
            <li>Send notifications about tracked applications</li>
            <li>Improve and optimize the extension</li>
            <li>Provide customer support</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Storage and Security</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li>All data is stored on secure servers with encryption</li>
            <li>Passwords are hashed using industry-standard bcrypt</li>
            <li>We use HTTPS for all data transmission</li>
            <li>Authentication tokens expire after 7 days</li>
            <li>We implement regular security audits</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Sharing</h2>
          <p className="text-gray-700 mb-3 font-semibold">We DO NOT:</p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li>Sell your data to third parties</li>
            <li>Share your data with advertisers</li>
            <li>Use your data for marketing purposes</li>
            <li>Access your LinkedIn or Naukri messages/emails</li>
            <li>Track your browsing outside of job pages</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights</h2>
          <p className="text-gray-700 mb-3">You have the right to:</p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li>Access your data at any time through the dashboard</li>
            <li>Delete your account and all associated data</li>
            <li>Export your data</li>
            <li>Opt-out of notifications</li>
            <li>Request data corrections</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Permissions Explained</h2>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Storage Permission</h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li>Stores authentication tokens locally</li>
            <li>Caches job application data for offline access</li>
            <li>Saves user preferences</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Notifications Permission</h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li>Shows success/error messages</li>
            <li>Alerts about pending confirmations</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Host Permissions (LinkedIn & Naukri)</h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li>Detects "Apply" button clicks</li>
            <li>Extracts job details from pages</li>
            <li>Only activates on job-related pages</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Third-Party Services</h2>
          <p className="text-gray-700 mb-3">We use:</p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li>Vercel (hosting)</li>
            <li>Railway (backend hosting)</li>
            <li>PostgreSQL (database)</li>
          </ul>
          <p className="text-gray-700 mt-3">
            These services have their own privacy policies and security measures.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Children&apos;s Privacy</h2>
          <p className="text-gray-700 leading-relaxed">
            JobTracker is not intended for users under 13 years of age. We do not knowingly 
            collect information from children.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to Privacy Policy</h2>
          <p className="text-gray-700 leading-relaxed">
            We may update this policy periodically. Users will be notified of significant 
            changes through the extension.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Retention</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li>Active accounts: Data retained indefinitely</li>
            <li>Deleted accounts: Data permanently deleted within 30 days</li>
            <li>Inactive accounts (2+ years): We may contact you before deletion</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
          <p className="text-gray-700 mb-3">For privacy concerns or questions:</p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li>Email: <a href="mailto:martianonmarsandearth@gmail.com" className="text-blue-600 hover:underline">martianonmarsandearth@gmail.com</a></li>
            <li>Feedback Form: Available in extension</li>
            <li>Website: <a href="https://job-tracker-jwue.vercel.app" className="text-blue-600 hover:underline">https://job-tracker-jwue.vercel.app</a></li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Compliance</h2>
          <p className="text-gray-700 mb-3">This extension complies with:</p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li>Chrome Web Store Developer Program Policies</li>
            <li>GDPR (for EU users)</li>
            <li>CCPA (for California users)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Chrome Web Store Limited Use Policy</h3>
          <p className="text-gray-700 leading-relaxed mb-3">
            The use of information received from Google APIs will adhere to the{' '}
            <a 
              href="https://developer.chrome.com/docs/webstore/program-policies/#userdata" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Chrome Web Store User Data Policy
            </a>, including the Limited Use requirements.
          </p>
          <p className="text-gray-700 mb-3">JobTracker&apos;s use of data from LinkedIn and Naukri is limited to:</p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li>Providing the core functionality of tracking job applications</li>
            <li>Displaying tracked applications in your personal dashboard</li>
            <li>No data is sold to third parties</li>
            <li>No data is used for advertising purposes</li>
            <li>No data is used for purposes unrelated to job application tracking</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Consent</h2>
          <p className="text-gray-700 leading-relaxed">
            By using JobTracker, you consent to this Privacy Policy.
          </p>
        </section>

        <hr className="my-8 border-gray-300" />

        <p className="text-center text-gray-600 font-semibold">
          JobTracker - Track Your Job Applications Effortlessly
        </p>
      </div>
    </div>
  );
}
