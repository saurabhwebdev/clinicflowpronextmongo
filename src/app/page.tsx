import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-black">
      {/* Simple Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <nav className="container mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            ClinicFlow
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/auth/signin" className="text-gray-600 hover:text-black transition-colors">
              Sign In
            </Link>
            <Link 
              href="/auth/signup" 
              className="rounded-full bg-black text-white px-4 py-2 text-sm hover:bg-gray-800 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 md:py-28 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col items-center text-center">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
                Healthcare Management
                <br />
                <span className="text-blue-600">System</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mb-10">
                Streamline your healthcare practice with our comprehensive clinic management solution.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-16">
                <Link 
                  href="/auth/signup" 
                  className="rounded-full bg-black text-white px-8 py-3 font-medium text-lg hover:bg-gray-800 transition-colors"
                >
                  Get Started
                </Link>
                <Link 
                  href="/auth/signin" 
                  className="rounded-full bg-white border border-gray-300 px-8 py-3 font-medium text-lg hover:bg-gray-50 transition-colors"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 md:py-28 bg-gray-50">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Key Features</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Everything you need to run your healthcare practice efficiently.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Appointment Management",
                  description: "Schedule and manage appointments with an intuitive interface.",
                },
                {
                  title: "Patient Records",
                  description: "Securely store and access patient records and medical history.",
                },
                {
                  title: "Billing & Invoicing",
                  description: "Generate invoices and manage payments seamlessly.",
                },
                {
                  title: "Inventory Management",
                  description: "Track medical supplies and equipment inventory.",
                },
                {
                  title: "Email Communication",
                  description: "Send automated emails and notifications to patients.",
                },
                {
                  title: "Reports & Analytics",
                  description: "Gain insights with comprehensive reporting tools.",
                },
              ].map((feature, index) => (
                <div key={index} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                    <span className="text-blue-600 text-xl font-bold">{index + 1}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl text-white p-8 md:p-16 text-center">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to get started?</h2>
              <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">
                Join healthcare providers who have streamlined their operations with ClinicFlow.
              </p>
              <Link 
                href="/auth/signup" 
                className="rounded-full bg-white text-blue-700 px-8 py-3 font-medium text-lg hover:bg-gray-100 transition-colors inline-block"
              >
                Start Now
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 bg-white">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center">
            <p className="text-gray-500 text-sm">© {new Date().getFullYear()} ClinicFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}