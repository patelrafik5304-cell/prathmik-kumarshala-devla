import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-indigo-700 text-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <span className="text-indigo-700 text-xl font-bold">S</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">Prathmik Kumarshala</h1>
              <p className="text-xs text-indigo-200">Excellence in Education</p>
            </div>
          </div>
          <Link
            href="/login"
            className="bg-white text-indigo-700 px-6 py-2 rounded-lg font-medium hover:bg-indigo-50 transition"
          >
            Login
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-r from-indigo-700 to-purple-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold mb-4">Welcome to Our School</h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Empowering students with quality education and modern learning tools
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login" className="bg-white text-indigo-700 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition">
              Student Portal
            </Link>
            <Link href="/login" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition">
              Admin Login
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">Our Features</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Student Management', desc: 'Complete student profile and performance tracking' },
              { title: 'Attendance System', desc: 'Digital attendance with real-time reports' },
              { title: 'Result Management', desc: 'Online results with downloadable reports' },
              { title: 'Staff Portal', desc: 'Dedicated portal for teaching staff' },
              { title: 'Announcements', desc: 'Instant school notices and updates' },
              { title: 'Gallery', desc: 'School events and memories showcase' },
            ].map((f, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
                <h4 className="text-xl font-semibold text-indigo-700 mb-2">{f.title}</h4>
                <p className="text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2026 Prathmik Kumarshala. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
