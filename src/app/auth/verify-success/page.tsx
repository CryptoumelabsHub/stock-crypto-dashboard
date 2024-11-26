import Link from 'next/link';

export default function VerifySuccess() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Email Verified Successfully!
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Thank you for verifying your email address. You can now access all features of the dashboard.
          </p>
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
