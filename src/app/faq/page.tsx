"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";

interface FAQ {
  question: string;
  answer: React.ReactNode;
}

const FAQS: FAQ[] = [
  {
    question: "What is the format of the CHES exam?",
    answer: (
      <div>
        <p className="mb-3">The CHES exam is a computer-based, multiple-choice test. Here are the key details:</p>
        <ul className="list-disc ml-5 space-y-2 text-sm text-gray-700">
          <li><strong>165 total questions</strong> — 150 are scored and 15 are unscored pilot questions (you won&apos;t know which are which).</li>
          <li><strong>3 hours</strong> to complete the exam.</li>
          <li>The exam is split into two blocks: Block 1 is questions 1–83, then there&apos;s an optional 10-minute break, and Block 2 is questions 84–165.</li>
          <li><strong>Important:</strong> You can go back and change answers within a block, but once you move to Block 2, you cannot go back to Block 1.</li>
          <li>You can take the exam at a <strong>PSI test center</strong> (over 400 worldwide) or from home via <strong>Live Remote Proctoring (LRP)</strong>.</li>
          <li>The break time (if you take it) is deducted from your total 3 hours.</li>
        </ul>
        <div className="mt-3 text-xs text-gray-400">
          <p>Source: <a href="https://www.nchec.org/ches" target="_blank" rel="noopener noreferrer" className="text-york-red hover:underline">NCHEC — CHES Exam Page</a></p>
        </div>
      </div>
    ),
  },
  {
    question: "When are the exam dates?",
    answer: (
      <div>
        <p className="mb-3">The CHES exam is offered twice a year — once in the spring (April) and once in the fall (October).</p>

        <div className="bg-gray-50 rounded-lg p-4 mb-3">
          <h4 className="font-semibold text-york-black text-sm mb-2">April 2026 Exam Window: April 22 – May 2, 2026</h4>
          <ul className="list-disc ml-5 space-y-1 text-sm text-gray-700">
            <li>Early Bird (Nov 1 – Nov 30, 2025): $280 nonstudent / $230 student</li>
            <li>Regular (Dec 1, 2025 – Jan 31, 2026): $340 nonstudent / $290 student</li>
            <li>Late (Feb 1 – Feb 28, 2026): $400 nonstudent / $350 student</li>
          </ul>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-3">
          <h4 className="font-semibold text-york-black text-sm mb-2">October 2026 Exam Window: October 14 – 24, 2026</h4>
          <ul className="list-disc ml-5 space-y-1 text-sm text-gray-700">
            <li>Early Bird (May 1 – May 31, 2026): $280 nonstudent / $230 student</li>
            <li>Regular (Jun 1 – Jul 31, 2026): $340 nonstudent / $290 student</li>
            <li>Late (Aug 1 – Aug 31, 2026): $400 nonstudent / $350 student</li>
          </ul>
        </div>

        <p className="text-sm text-gray-600">Student pricing applies only if you are enrolled in 9+ semester credits (or 12+ quarter hours) at the time you apply. Fees include a $100 nonrefundable processing fee if you don&apos;t meet eligibility or withdraw.</p>
        <div className="mt-3 text-xs text-gray-400">
          <p>Source: <a href="https://www.nchec.org/ches-exam-schedule-fees" target="_blank" rel="noopener noreferrer" className="text-york-red hover:underline">NCHEC — CHES Schedule &amp; Fees</a></p>
        </div>
      </div>
    ),
  },
  {
    question: "Can I retake the exam if I don't pass?",
    answer: (
      <div>
        <p className="mb-3">Yes! If you don&apos;t pass on your first try, you are allowed to take it again:</p>
        <ul className="list-disc ml-5 space-y-2 text-sm text-gray-700">
          <li>You must wait until the <strong>next testing window</strong> (e.g., if you took it in April and didn&apos;t pass, the next chance is October).</li>
          <li>You will need to submit a new application and pay the registration fee again, but you may receive a <strong>reduced retake fee</strong> if you retake during the very next testing cycle.</li>
          <li>The reduced retake fee is only available for the immediately following test cycle. After that, full fees apply.</li>
          <li>There is <strong>no limit</strong> on how many times you can retake the exam.</li>
        </ul>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
          <p className="text-sm text-green-800"><strong>Tip:</strong> Many people pass on their second or third attempt. Use your score report to focus on areas where you scored &quot;Below Proficient&quot; or &quot;Moderately Proficient.&quot;</p>
        </div>
        <div className="mt-3 text-xs text-gray-400">
          <p>Source: <a href="https://www.nchec.org/score-reports" target="_blank" rel="noopener noreferrer" className="text-york-red hover:underline">NCHEC — Understanding Your Score Report</a></p>
        </div>
      </div>
    ),
  },
  {
    question: "What score do I need to pass?",
    answer: (
      <div>
        <p className="mb-3">You need a <strong>scaled score of 600 out of 800</strong> to pass:</p>
        <ul className="list-disc ml-5 space-y-2 text-sm text-gray-700">
          <li>The passing score is set using the <strong>Modified Angoff method</strong> — a group of health education experts decided what a minimally qualified person should know. Your score is based on that standard, not on how other test-takers did.</li>
          <li><strong>No penalty for guessing</strong> — answer every question even if you&apos;re not sure.</li>
          <li>You&apos;ll get a <strong>provisional pass/fail result by email within minutes</strong> after finishing. An official score report will follow later.</li>
          <li>Your official score report shows how you performed in each Area of Responsibility, rated as &quot;Proficient,&quot; &quot;Moderately Proficient,&quot; or &quot;Below Proficient.&quot;</li>
        </ul>
        <div className="mt-3 text-xs text-gray-400">
          <p>Source: <a href="https://www.nchec.org/score-reports" target="_blank" rel="noopener noreferrer" className="text-york-red hover:underline">NCHEC — Understanding Your Score Report</a></p>
        </div>
      </div>
    ),
  },
  {
    question: "What does this credential mean for me professionally?",
    answer: (
      <div>
        <p className="mb-3">Earning the CHES credential tells the world that you:</p>
        <ul className="list-disc ml-5 space-y-2 text-sm text-gray-700">
          <li>Met national academic standards in health education.</li>
          <li>Passed a rigorous, nationally recognized exam proving your knowledge.</li>
          <li>Are committed to ongoing professional development through continuing education.</li>
        </ul>
        <p className="mt-3 text-sm text-gray-700">The CHES certification has been nationally accredited by the NCCA since 2008. At the end of 2024, there were nearly <strong>16,000 active CHES and MCHES credential-holders</strong> across the U.S. and internationally. Many employers view CHES as a standard of quality — it can give you an edge in the job market, and some employers offer higher pay or cover exam fees for certified employees.</p>
        <p className="mt-2 text-sm text-gray-700">After gaining experience, you can also pursue the <strong>MCHES</strong> (Master Certified Health Education Specialist) for advanced-level recognition.</p>
        <div className="mt-3 text-xs text-gray-400">
          <p>Source: <a href="https://www.nchec.org/health-education-specialist-certification-exams" target="_blank" rel="noopener noreferrer" className="text-york-red hover:underline">NCHEC — Health Education Specialist Certification Exams</a></p>
        </div>
      </div>
    ),
  },
  {
    question: "How do I keep my certification? (Renewal)",
    answer: (
      <div>
        <p className="mb-3">Yes, you need to maintain your certification:</p>
        <ul className="list-disc ml-5 space-y-2 text-sm text-gray-700">
          <li><strong>Annual Renewal Fee:</strong> $70 per year.</li>
          <li><strong>Certification Cycle:</strong> 5 years.</li>
          <li><strong>Continuing Education:</strong> Earn 75 Continuing Education Contact Hours (CECH) over each 5-year cycle. NCHEC recommends about 15 hours per year.</li>
          <li><strong>Category I (min 45 hours):</strong> NCHEC-approved continuing education from designated providers. Reported automatically.</li>
          <li><strong>Category II (max 30 hours):</strong> Other relevant learning opportunities not pre-approved by NCHEC. You self-report these.</li>
          <li><strong>Continuing Competency (5 hours):</strong> Complete either an end-of-course assessment from an approved provider OR a work performance assessment.</li>
          <li><strong>Extensions:</strong> If you haven&apos;t finished all hours, you can request an extension of up to 2 years (one year at a time).</li>
        </ul>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
          <p className="text-sm text-blue-800"><strong>Bottom line:</strong> You do NOT have to retake the exam to keep your certification — as long as you complete your continuing education hours and pay your annual fee on time.</p>
        </div>
        <div className="mt-3 text-xs text-gray-400">
          <p>Source: <a href="https://www.nchec.org/ches-recertification" target="_blank" rel="noopener noreferrer" className="text-york-red hover:underline">NCHEC — CHES Recertification</a></p>
        </div>
      </div>
    ),
  },
  {
    question: "What jobs find the CHES credential valuable?",
    answer: (
      <div>
        <p className="mb-3">The CHES credential is valued across many industries. Over <strong>550 companies and organizations</strong> have posted jobs that require or prefer CHES certification.</p>

        <h4 className="font-semibold text-sm text-york-black mb-2">Common job settings:</h4>
        <ul className="list-disc ml-5 space-y-1 text-sm text-gray-700 mb-3">
          <li>Community and nonprofit organizations</li>
          <li>Healthcare and hospitals (patient education, wellness programs)</li>
          <li>Government agencies (local, state, and federal health departments)</li>
          <li>Schools and universities (K–12 school health, higher education)</li>
          <li>Corporate/worksite wellness (employee health programs)</li>
        </ul>

        <h4 className="font-semibold text-sm text-york-black mb-2">Common job titles:</h4>
        <div className="flex flex-wrap gap-2 mb-3">
          {["Health Educator", "Public Health Educator", "Health Promotion Specialist", "Wellness Coordinator", "Community Health Worker", "Patient Educator", "Health Coach", "Health Program Manager", "Health Engagement Coordinator"].map((title) => (
            <span key={title} className="text-xs px-3 py-1 bg-york-red-light text-york-red rounded-full font-medium">{title}</span>
          ))}
        </div>

        <p className="text-sm text-gray-700">According to the U.S. Bureau of Labor Statistics, there were about <strong>71,800 health education specialist jobs</strong> in 2024, with the field expected to grow about 4% from 2024 to 2034. The median annual salary was approximately <strong>$63,000</strong>.</p>
        <div className="mt-3 text-xs text-gray-400">
          <p>Source: <a href="https://www.bls.gov/ooh/community-and-social-service/health-educators.htm" target="_blank" rel="noopener noreferrer" className="text-york-red hover:underline">U.S. Bureau of Labor Statistics — Health Education Specialists</a></p>
        </div>
      </div>
    ),
  },
  {
    question: "What are the Areas of Responsibility?",
    answer: (
      <div>
        <p className="mb-3">The CHES exam is built around <strong>Eight Areas of Responsibility</strong> — the core skill areas every health education specialist needs to master:</p>
        <div className="space-y-2 mb-3">
          {[
            { num: "I", name: "Assessment of Needs and Capacity", desc: "Figuring out what a community or group needs in terms of health education, and what resources are available." },
            { num: "II", name: "Planning", desc: "Designing health education programs based on what you've learned from the assessment." },
            { num: "III", name: "Implementation", desc: "Putting those programs into action — delivering training, running events, rolling out campaigns." },
            { num: "IV", name: "Evaluation and Research", desc: "Measuring whether the program worked, collecting data, and using research to improve future efforts." },
            { num: "V", name: "Advocacy", desc: "Speaking up for health issues — pushing for policy changes, resources, and health equity." },
            { num: "VI", name: "Communication", desc: "Creating and delivering clear health messages through various channels." },
            { num: "VII", name: "Leadership and Management", desc: "Leading teams, managing resources, and navigating organizations to get health education work done." },
            { num: "VIII", name: "Ethics and Professionalism", desc: "Maintaining ethical standards, acting with integrity, and committing to professional growth." },
          ].map((area) => (
            <div key={area.num} className="flex gap-3 text-sm">
              <span className="text-york-red font-bold whitespace-nowrap">Area {area.num}</span>
              <div>
                <span className="font-semibold text-york-black">{area.name}:</span>{" "}
                <span className="text-gray-600">{area.desc}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
          <p className="text-sm text-yellow-800"><strong>Note:</strong> A new practice analysis (HESPA III 2025) has been completed and will expand the model to 9 Areas of Responsibility for the 2027 exams. But for all exams through 2026, the current 8 areas listed above are what you&apos;ll be tested on.</p>
        </div>
        <div className="mt-3 text-xs text-gray-400">
          <p>Source: <a href="https://www.nchec.org/responsibilities--competencies" target="_blank" rel="noopener noreferrer" className="text-york-red hover:underline">NCHEC — Responsibilities &amp; Competencies</a></p>
        </div>
      </div>
    ),
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10 pb-6 border-b-4 border-york-red">
          <h1 className="text-2xl sm:text-3xl font-bold text-york-black mb-2">
            Frequently Asked Questions
          </h1>
          <p className="text-sm text-gray-500">
            Certified Health Education Specialist (CHES) Exam
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Administered by the National Commission for Health Education Credentialing (NCHEC)
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3">
          {FAQS.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md overflow-hidden"
            >
              <button
                onClick={() => toggle(index)}
                className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-gray-50 transition"
              >
                <span className="font-semibold text-york-black text-sm sm:text-base">
                  {faq.question}
                </span>
                <svg
                  className={`w-5 h-5 text-york-red flex-shrink-0 transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openIndex === index && (
                <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-10 pt-6 border-t-2 border-gray-200">
          <p className="text-xs text-gray-400">
            For the most up-to-date information, visit{" "}
            <a
              href="https://www.nchec.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-york-red hover:underline"
            >
              www.nchec.org
            </a>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            York College — Department of Health and Human Performance
          </p>
        </div>
      </div>
    </>
  );
}
