import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <h1 className="text-5xl font-bold mb-6">🌍 Welcome to Dhara</h1>
      <p className="text-lg text-gray-600 mb-8">
        A platform to report, track, and manage issues in your community.
      </p>

      <div className="flex gap-4">
        <Link
          href="/report"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Go to Reports
        </Link>
        <Link
          href="/about"
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
        >
          Learn More
        </Link>
      </div>
    </main>
  );
}
