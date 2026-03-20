import Link from "next/link";

const AREAS = [
  "Assessment of Needs and Capacity",
  "Planning",
  "Implementation",
  "Evaluation and Research",
  "Advocacy",
  "Communication",
  "Leadership and Management",
  "Ethics and Professionalism",
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-york-red text-white">
        <div className="max-w-5xl mx-auto px-6 py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">CHES Study Hub</h1>
          <p className="text-lg md:text-xl opacity-90 mb-2">
            York College — Department of Health and Human Performance
          </p>
          <p className="text-base md:text-lg opacity-80 max-w-2xl mx-auto mt-4 mb-10">
            Prepare for the Certified Health Education Specialist exam. Assess your
            knowledge across the 8 Areas of Responsibility and practice until
            you&apos;re ready.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-white text-york-red px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-white/10 transition"
            >
              Log In
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center text-york-black mb-10">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-14 h-14 bg-york-red-light text-york-red rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              1
            </div>
            <h3 className="font-semibold text-lg mb-2">Take the Pre-Assessment</h3>
            <p className="text-gray-600 text-sm">
              Identify your strengths and areas for growth across all 8 Areas of
              Responsibility.
            </p>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 bg-york-red-light text-york-red rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              2
            </div>
            <h3 className="font-semibold text-lg mb-2">Practice by Area</h3>
            <p className="text-gray-600 text-sm">
              Focus your study on the areas where you need the most improvement
              with targeted practice quizzes.
            </p>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 bg-york-red-light text-york-red rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              3
            </div>
            <h3 className="font-semibold text-lg mb-2">Track Your Progress</h3>
            <p className="text-gray-600 text-sm">
              Monitor your scores over time and see your improvement across every
              area.
            </p>
          </div>
        </div>
      </section>

      {/* 8 Areas */}
      <section className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center text-york-black mb-10">
            The 8 Areas of Responsibility
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {AREAS.map((area, i) => (
              <div
                key={i}
                className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center"
              >
                <span className="text-york-red font-bold text-lg">
                  {i + 1}
                </span>
                <p className="text-sm font-medium text-york-black mt-1">
                  {area}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Faculty Support Section */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-york-black mb-3">
            Supported by Your Faculty
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm">
            CHES Study Hub is supported by faculty in the Department of Health and Human Performance
            at York College, dedicated to helping students succeed on the CHES exam.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          {[
            { name: "Dr. Erin Jacques", initials: "EJ" },
            { name: "Dr. Nicole Grosskopf", initials: "NG" },
            { name: "Dr. Elizabeth Vignola", initials: "EV" },
          ].map((faculty) => (
            <div key={faculty.initials} className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-york-red-light flex items-center justify-center mb-3">
                <span className="text-york-red font-bold text-lg">{faculty.initials}</span>
              </div>
              <p className="font-semibold text-york-black text-sm">{faculty.name}</p>
              <p className="text-xs text-gray-400">Faculty Advisor</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-york-black text-white py-8">
        <div className="max-w-5xl mx-auto px-6 text-center text-sm opacity-70">
          <p>CHES Study Hub — York College, Department of Health and Human Performance</p>
          <p className="mt-1">
            Preparing future Certified Health Education Specialists
          </p>
        </div>
      </footer>
    </div>
  );
}
