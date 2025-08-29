import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-8">
      {/* Hero Section */}
      <section className="text-center max-w-2xl">
        <h1 className="text-6xl font-extrabold mb-6 text-gray-900 drop-shadow-sm">
           Dhara
        </h1>
        <p className="text-lg text-gray-700 mb-8">
          Empower your community by reporting issues, tracking progress, and
          making an impact together.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/report"
            className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 transition"
          >
            Start Reporting
          </Link>
          <Link
            href="/about"
            className="px-6 py-3 border border-gray-300 bg-white rounded-xl shadow hover:bg-gray-50 transition"
          >
            Learn More
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-3 gap-6 mt-16 max-w-4xl w-full">
        <div className="p-6 bg-white rounded-2xl shadow hover:shadow-lg transition text-center">
          <h3 className="text-xl font-semibold mb-2">Report Issues</h3>
          <p className="text-gray-600">
            Quickly highlight problems in your community and bring attention to
            them.
          </p>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow hover:shadow-lg transition text-center">
          <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
          <p className="text-gray-600">
            See updates and monitor how issues are being resolved over time.
          </p>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow hover:shadow-lg transition text-center">
          <h3 className="text-xl font-semibold mb-2">Build Community</h3>
          <p className="text-gray-600">
            Collaborate with neighbors and local leaders to make change happen.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-20 text-sm text-gray-500">
        Made with ❤️ for the community
      </footer>
    </main>
  );
}
