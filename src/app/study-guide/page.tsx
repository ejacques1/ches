"use client";

import Navbar from "@/components/Navbar";

const AREAS = [
  {
    num: "I",
    id: 1,
    title: "Assessment of Needs and Capacity",
    oneliner: "Figure out what the problems are before you do anything else.",
    bullets: [
      "Survey community members about their health concerns",
      "Review health data from local health departments",
      "Talk to stakeholders (teachers, employers, community leaders)",
      "Look at hospital admission rates and disease trends",
      "Identify existing resources and what's already working",
      "Assess gaps between current conditions and desired outcomes",
      "Examine environmental and social factors affecting health",
    ],
    terms: [
      "Needs assessment", "Community health assessment", "PRECEDE-PROCEED",
      "Primary data", "Secondary data", "Health disparities",
      "Social determinants of health", "Priority population", "Capacity building",
    ],
  },
  {
    num: "II",
    id: 2,
    title: "Planning",
    oneliner: "Build the roadmap — goals, strategies, timeline, and resources.",
    bullets: [
      "Identify goals and objectives based on assessment findings",
      "Determine target audience and priority populations",
      "Select evidence-based strategies and interventions",
      "Allocate resources (budget, staff, time)",
      "Establish timelines and milestones",
      "Identify partnerships and stakeholders needed",
      "Develop evaluation methods to measure success",
      "Create an action plan with clear steps",
    ],
    terms: [
      "SMART objectives", "Logic model", "Evidence-based practice",
      "Intervention mapping", "Theory of change", "Stakeholder engagement",
      "Health Belief Model", "Social Cognitive Theory", "Scope of work",
    ],
  },
  {
    num: "III",
    id: 3,
    title: "Implementation",
    oneliner: "Put the plan into action — deliver, train, monitor, adjust.",
    bullets: [
      "Deliver health education activities to target audience",
      "Train and support staff or facilitators",
      "Provide ongoing guidance and supervision for quality",
      "Document activities and participant engagement",
      "Monitor program delivery in real time",
      "Make adjustments based on what you're observing",
      "Ensure materials are accessible and culturally appropriate",
      "Maintain communication with stakeholders and partners",
      "Track attendance and participation",
    ],
    terms: [
      "Formative evaluation", "Process evaluation", "Fidelity",
      "Cultural competence", "Health literacy", "Pilot testing",
      "Facilitation", "Dosage", "Reach",
    ],
  },
  {
    num: "IV",
    id: 4,
    title: "Evaluation and Research",
    oneliner: "Measure if it worked — collect data, analyze outcomes, report findings.",
    bullets: [
      "Develop an evaluation plan with clear metrics",
      "Collect quantitative and qualitative data",
      "Measure changes in knowledge, behavior, and health outcomes",
      "Compare results against original goals and objectives",
      "Use findings to improve future programs",
      "Share results with stakeholders and funders",
      "Conduct or apply research to inform practice",
      "Ensure ethical standards in research and evaluation",
    ],
    terms: [
      "Summative evaluation", "Impact evaluation", "Outcome evaluation",
      "Validity", "Reliability", "Statistical significance",
      "IRB / Ethics review", "Pre-test / Post-test", "Control group", "Mixed methods",
    ],
  },
  {
    num: "V",
    id: 5,
    title: "Advocacy",
    oneliner: "Speak up for health issues, push for change, and fight for equity.",
    bullets: [
      "Advocate for policies that improve community health",
      "Educate decision-makers about health needs and priorities",
      "Mobilize communities to take action on health issues",
      "Push for fair resource allocation and funding",
      "Champion health equity and address disparities",
      "Build coalitions with organizations that share your goals",
      "Influence legislation and organizational policies",
      "Empower individuals to advocate for their own health",
    ],
    terms: [
      "Health equity", "Policy advocacy", "Coalition building",
      "Community organizing", "Grassroots advocacy", "Lobbying vs. advocacy",
      "Social justice", "Empowerment", "Health in All Policies",
    ],
  },
  {
    num: "VI",
    id: 6,
    title: "Communication",
    oneliner: "Create and deliver clear health messages through the right channels.",
    bullets: [
      "Develop health messages tailored to your audience",
      "Use appropriate reading levels and language",
      "Deliver messages through multiple channels (in-person, print, digital, social media)",
      "Ensure all materials are culturally sensitive and accessible",
      "Use technology and social media strategically",
      "Apply principles of health literacy to all communications",
      "Test messages with your target audience before full rollout",
      "Adapt communication style for individuals, small groups, and large audiences",
    ],
    terms: [
      "Health literacy", "Health communication", "Tailored messaging",
      "Plain language", "Social marketing", "Risk communication",
      "Audience segmentation", "Media advocacy", "Cultural sensitivity",
      "Readability (Flesch-Kincaid)",
    ],
  },
  {
    num: "VII",
    id: 7,
    title: "Leadership and Management",
    oneliner: "Lead teams, manage resources, and navigate organizations to get the work done.",
    bullets: [
      "Manage budgets, timelines, and program resources",
      "Lead and motivate teams and volunteers",
      "Coordinate across departments and organizations",
      "Apply for and manage grants and funding",
      "Mentor and train other health education professionals",
      "Navigate organizational structures and politics",
      "Use strategic planning to guide long-term direction",
      "Demonstrate accountability through reporting and documentation",
    ],
    terms: [
      "Grant writing", "Strategic planning", "Budget management",
      "Team leadership", "Organizational behavior", "Conflict resolution",
      "Project management", "Quality improvement", "Sustainability",
    ],
  },
  {
    num: "VIII",
    id: 8,
    title: "Ethics and Professionalism",
    oneliner: "Do the right thing — maintain integrity, grow professionally, uphold standards.",
    bullets: [
      "Follow the Health Education Code of Ethics in all work",
      "Maintain confidentiality and respect for individuals",
      "Practice within your scope of training and competence",
      "Commit to ongoing professional development and learning",
      "Stay current with research, trends, and best practices",
      "Act with integrity, honesty, and transparency",
      "Address ethical dilemmas thoughtfully and responsibly",
      "Promote diversity, inclusion, and equity in all settings",
    ],
    terms: [
      "Code of Ethics", "Informed consent", "Confidentiality",
      "Scope of practice", "Professional development", "Cultural humility",
      "Ethical decision-making", "Continuing education (CECH)", "NCHEC standards",
    ],
  },
];

export default function StudyGuidePage() {
  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10 pb-6 border-b-4 border-york-red">
          <h1 className="text-2xl sm:text-3xl font-bold text-york-black mb-2">
            Eight Areas of Responsibility
          </h1>
          <p className="text-sm text-gray-500">
            Quick-scan reference with key bullet points &amp; terms for the CHES exam
          </p>
        </div>

        {/* Areas */}
        <div className="space-y-6">
          {AREAS.map((area) => (
            <div
              key={area.id}
              className="bg-gray-50 border-l-4 border-york-red rounded-r-xl p-5 sm:p-6"
            >
              {/* Area header */}
              <p className="text-xs font-semibold text-york-red uppercase tracking-wide mb-1">
                Area {area.num}
              </p>
              <h2 className="text-lg sm:text-xl font-semibold text-york-black mb-1">
                {area.title}
              </h2>
              <p className="text-sm text-gray-500 italic mb-4">{area.oneliner}</p>

              {/* Key Bullet Points */}
              <p className="text-xs font-semibold text-york-red uppercase tracking-wide mb-2">
                Key Bullet Points
              </p>
              <ul className="list-disc ml-5 mb-4 space-y-1">
                {area.bullets.map((b, i) => (
                  <li key={i} className="text-sm text-gray-700 leading-relaxed">
                    {b}
                  </li>
                ))}
              </ul>

              {/* Key Terms */}
              <p className="text-xs font-semibold text-york-red uppercase tracking-wide mb-2">
                Key Terms
              </p>
              <div className="flex flex-wrap gap-2">
                {area.terms.map((t, i) => (
                  <span
                    key={i}
                    className="text-xs px-3 py-1 bg-york-red-light text-york-red rounded-full font-medium"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-10 pt-6 border-t-2 border-gray-200">
          <p className="text-xs text-gray-400">
            Source:{" "}
            <a
              href="https://www.nchec.org/responsibilities--competencies"
              target="_blank"
              rel="noopener noreferrer"
              className="text-york-red hover:underline"
            >
              NCHEC — Responsibilities &amp; Competencies
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
