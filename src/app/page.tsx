import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  // Fetch report stats from the database
  const reports = await prisma.report.findMany();
  const totalReports = reports.length;
  const pending = reports.filter(r => r.status === "PENDING").length;
  const inProgress = reports.filter(r => r.status === "IN_PROGRESS").length;
  const resolved = reports.filter(r => r.status === "RESOLVED").length;
  const authorityContacted = reports.filter(r => r.status === "AUTHORITY_CONTACTED").length;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-8">

      {/* Hero Section */}
      <section className="text-center max-w-3xl mb-12">
        <h1 className="text-6xl font-extrabold mb-6 text-gray-900 drop-shadow-sm">
          Dhara
        </h1>
        <p className="text-lg text-gray-700 mb-8">
          Your voice matters. Every report submitted helps shape safer, cleaner, and stronger neighborhoods. Be part of real change in your community.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/report"
            className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 transition"
          >
            Make an Impact
          </Link>

          <Link
            href="/about"
            className="px-6 py-3 border border-gray-300 bg-white rounded-xl shadow hover:bg-gray-50 transition"
          >
            Learn About Us
          </Link>
        </div>
      </section>

      {/* Dynamic Stats Section */}
      <section className="grid md:grid-cols-5 gap-6 max-w-5xl w-full mb-16 text-center">
        <div className="p-6 bg-white rounded-2xl shadow hover:shadow-lg transition">
          <h3 className="text-2xl font-bold mb-2">{totalReports}</h3>
          <p className="text-gray-600">Total Reports</p>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow hover:shadow-lg transition">
          <h3 className="text-2xl font-bold mb-2">{pending}</h3>
          <p className="text-gray-600">Pending</p>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow hover:shadow-lg transition">
          <h3 className="text-2xl font-bold mb-2">{inProgress}</h3>
          <p className="text-gray-600">In Progress</p>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow hover:shadow-lg transition">
          <h3 className="text-2xl font-bold mb-2">{authorityContacted}</h3>
          <p className="text-gray-600">Authority Contacted</p>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow hover:shadow-lg transition">
          <h3 className="text-2xl font-bold mb-2">{resolved}</h3>
          <p className="text-gray-600">Resolved</p>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="bg-blue-600 text-white rounded-2xl p-10 max-w-3xl w-full text-center mb-16 shadow-lg">
        <h2 className="text-3xl font-bold mb-4">Join the Change Today</h2>
        <p className="mb-6">Submit your first report and see the direct impact it can have in your area.</p>
          <Link
            href="/form?model=Report"
            className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl shadow hover:bg-gray-100 transition"
          >
            Submit a Report
          </Link>
      </section>

      {/* Footer */}
      <footer className="mt-12 text-sm text-gray-500 flex flex-col items-center gap-2">
        <p>Made with ❤️ for the community</p>
      </footer>
    </main>
  );
}
