import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-black">
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 md:py-28 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col items-center text-center">
              <div className="inline-block bg-black text-white px-4 py-1.5 rounded-full text-sm font-medium mb-8">
                New Release
              </div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
                Healthcare Management
                <br />
                <span className="text-blue-600">Reimagined</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mb-10">
                Streamline your healthcare practice with our intuitive, powerful, and comprehensive clinic management solution.
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

              <div className="relative w-full max-w-5xl mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl transform rotate-1"></div>
                <div className="relative border border-gray-200 rounded-xl overflow-hidden shadow-2xl">
                  <Image 
                    src="/images/dashboard-preview.svg" 
                    alt="ClinicFlow Dashboard Preview" 
                    width={1200} 
                    height={800}
                    className="w-full h-auto"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 md:py-28 bg-gray-50">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Powerful Features</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Everything you need to run your healthcare practice efficiently and effectively.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Appointment Management",
                  description: "Schedule, reschedule, and manage appointments with an intuitive calendar interface.",
                },
                {
                  title: "Patient Records",
                  description: "Securely store and access patient records, medical history, and treatment plans.",
                },
                {
                  title: "Billing & Invoicing",
                  description: "Generate invoices, process payments, and manage insurance claims seamlessly.",
                },
                {
                  title: "Telemedicine",
                  description: "Conduct virtual consultations with integrated video conferencing tools.",
                },
                {
                  title: "Analytics",
                  description: "Gain insights into your practice with comprehensive reporting and analytics.",
                },
                {
                  title: "Mobile Access",
                  description: "Access your clinic dashboard on any device, anytime, anywhere.",
                },
              ].map((feature, index) => (
                <div key={index} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
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
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to transform your practice?</h2>
              <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">
                Join thousands of healthcare providers who have streamlined their operations with ClinicFlow.
              </p>
              <Link 
                href="/auth/signup" 
                className="rounded-full bg-white text-blue-700 px-8 py-3 font-medium text-lg hover:bg-gray-100 transition-colors inline-block"
              >
                Start Your Free Trial
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}