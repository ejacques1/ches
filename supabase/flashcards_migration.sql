-- ============================================================
-- CHES Study Hub — Flashcards Migration
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Create the flashcards table
CREATE TABLE IF NOT EXISTS flashcards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  area_id INTEGER NOT NULL CHECK (area_id BETWEEN 1 AND 8),
  term TEXT NOT NULL,
  definition TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

-- 3. RLS policies: all authenticated users can read, only admins can write
CREATE POLICY "Authenticated users can read active flashcards"
  ON flashcards FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage flashcards"
  ON flashcards FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- 4. Index for fast area lookups
CREATE INDEX idx_flashcards_area_id ON flashcards(area_id);
CREATE INDEX idx_flashcards_active ON flashcards(is_active);

-- ============================================================
-- 5. Seed flashcard data for all 8 Areas of Responsibility
-- ============================================================

INSERT INTO flashcards (area_id, term, definition) VALUES

-- ============================================================
-- AREA 1: Assessment of Needs and Capacity
-- ============================================================
(1, 'Needs Assessment', 'A systematic process to determine the gap between the current health status and the desired health status of a community or population, used to prioritize health education programs.'),
(1, 'Primary Data', 'Original data collected firsthand by the researcher through methods such as surveys, interviews, focus groups, and observations.'),
(1, 'Secondary Data', 'Data that has already been collected by someone else for another purpose, such as census data, hospital records, or surveillance reports.'),
(1, 'Health Disparities', 'Preventable differences in the burden of disease, injury, violence, or opportunities to achieve optimal health experienced by socially disadvantaged populations.'),
(1, 'Social Determinants of Health', 'The conditions in the environments where people are born, live, learn, work, play, worship, and age that affect a wide range of health outcomes and risks.'),
(1, 'Community Capacity', 'The characteristics of a community that affect its ability to identify, mobilize, and address health and social problems.'),
(1, 'PRECEDE-PROCEED Model', 'A comprehensive planning framework developed by Lawrence Green that guides the assessment of social, epidemiological, behavioral, environmental, educational, and administrative factors for health promotion planning.'),
(1, 'Focus Group', 'A qualitative data collection method where a small group of people discuss a specific topic guided by a trained moderator, used to explore attitudes, beliefs, and perceptions.'),
(1, 'Epidemiology', 'The study of the distribution and determinants of health-related states or events in specified populations, and the application of this study to the control of health problems.'),
(1, 'Prevalence', 'The proportion of a population found to have a specific health condition at a given point in time or over a specified period.'),
(1, 'Incidence', 'The number of new cases of a disease or condition occurring in a population during a specific time period.'),
(1, 'Stakeholder', 'Any individual, group, or organization that has an interest in or is affected by the health education program, including community members, funders, and partner organizations.'),
(1, 'Asset Mapping', 'A process of identifying the strengths, resources, and capacities that exist within a community, rather than focusing solely on needs and deficits.'),
(1, 'Cultural Competence', 'The ability of health educators to effectively deliver services that meet the social, cultural, and linguistic needs of the community being served.'),
(1, 'Health Literacy', 'The degree to which individuals have the capacity to obtain, process, and understand basic health information and services needed to make appropriate health decisions.'),

-- ============================================================
-- AREA 2: Planning
-- ============================================================
(2, 'Program Planning', 'The systematic process of developing goals, objectives, activities, timelines, and evaluation methods for a health education program.'),
(2, 'SMART Objectives', 'Objectives that are Specific, Measurable, Achievable, Relevant, and Time-bound — used to clearly define expected outcomes.'),
(2, 'Logic Model', 'A visual representation that links a program''s inputs, activities, outputs, and outcomes, showing the logical relationships between resources invested and results expected.'),
(2, 'Learning Objectives', 'Statements that describe what participants should know, feel, or be able to do after completing a health education session or program.'),
(2, 'Behavioral Objective', 'A specific statement describing an observable action that participants are expected to perform as a result of a health education intervention.'),
(2, 'Health Belief Model', 'A theoretical framework suggesting that health behavior is determined by perceived susceptibility, perceived severity, perceived benefits, perceived barriers, cues to action, and self-efficacy.'),
(2, 'Theory of Planned Behavior', 'A model that predicts behavioral intention based on attitudes toward the behavior, subjective norms, and perceived behavioral control.'),
(2, 'Social Cognitive Theory', 'Bandura''s theory emphasizing reciprocal determinism — the interaction among personal factors, behavior, and environment — with self-efficacy as a central construct.'),
(2, 'Transtheoretical Model (Stages of Change)', 'A model describing behavior change as a process through stages: precontemplation, contemplation, preparation, action, and maintenance.'),
(2, 'Self-Efficacy', 'An individual''s belief in their own ability to successfully perform a specific behavior or task, a key predictor of behavior change.'),
(2, 'Social-Ecological Model', 'A framework recognizing that health behavior is influenced by multiple levels: individual, interpersonal, organizational, community, and policy.'),
(2, 'Intervention Mapping', 'A systematic protocol for designing evidence-based health promotion programs, using theory and evidence at each step of program development.'),
(2, 'Scope and Sequence', 'An organizational plan that defines the breadth (scope) and order (sequence) in which content will be taught in a health education curriculum.'),
(2, 'Mission Statement', 'A brief description of an organization''s or program''s fundamental purpose — what it does, who it serves, and how it serves them.'),

-- ============================================================
-- AREA 3: Implementation
-- ============================================================
(3, 'Implementation', 'The process of putting a planned health education program into action, including delivering activities, managing logistics, and engaging participants.'),
(3, 'Fidelity', 'The degree to which a health education program is delivered as originally designed and planned, without significant alterations.'),
(3, 'Pilot Testing', 'A small-scale trial run of a program or materials conducted before full implementation to identify problems and make improvements.'),
(3, 'Training of Trainers (TOT)', 'A model where selected individuals are trained to deliver a program to others, extending the reach of health education efforts.'),
(3, 'Health Communication', 'The study and use of communication strategies to inform and influence individual and community decisions that enhance health.'),
(3, 'Tailored Messaging', 'Health communication that is customized to reach a specific individual based on their unique characteristics, beliefs, and readiness to change.'),
(3, 'Targeted Messaging', 'Health communication designed for a defined subgroup of a population, based on shared characteristics such as age, race/ethnicity, or risk factors.'),
(3, 'Community Mobilization', 'The process of engaging community members and organizations to take collective action on health issues affecting their community.'),
(3, 'Coalition', 'A formal alliance of organizations and individuals working together toward a common health goal, pooling resources and expertise.'),
(3, 'Facilitator', 'A person who guides group discussions, activities, or learning experiences, ensuring participation and keeping the group focused on objectives.'),
(3, 'Informed Consent', 'The process by which participants are fully informed about a program or study and voluntarily agree to participate, a key ethical requirement.'),
(3, 'Sustainability', 'The ability of a program to maintain its activities, outcomes, and benefits over time, including after initial funding ends.'),
(3, 'Cultural Adaptation', 'The process of modifying program materials, messages, and delivery methods to be appropriate and effective for a specific cultural group.'),

-- ============================================================
-- AREA 4: Evaluation and Research
-- ============================================================
(4, 'Formative Evaluation', 'Evaluation conducted during program development or early implementation to improve the program before full-scale delivery.'),
(4, 'Process Evaluation', 'Assessment of how well a program was implemented — tracking activities completed, participants reached, and whether the program was delivered as planned.'),
(4, 'Outcome Evaluation', 'Measurement of changes in knowledge, attitudes, skills, or behaviors that occurred as a result of the health education program.'),
(4, 'Impact Evaluation', 'Assessment of the immediate observable effects of a program, such as changes in behavior, policy, or environmental conditions.'),
(4, 'Summative Evaluation', 'Evaluation conducted after program completion to determine overall effectiveness and whether goals and objectives were achieved.'),
(4, 'Reliability', 'The consistency of a measurement instrument — the degree to which it produces the same results under the same conditions across multiple administrations.'),
(4, 'Validity', 'The degree to which a measurement instrument accurately measures what it is intended to measure.'),
(4, 'Qualitative Research', 'Research methods that collect non-numerical data through interviews, focus groups, and observations to understand experiences, meanings, and perspectives.'),
(4, 'Quantitative Research', 'Research methods that collect numerical data through surveys, experiments, and statistical analysis to measure variables and test hypotheses.'),
(4, 'Institutional Review Board (IRB)', 'A committee that reviews and approves research involving human subjects to ensure the protection of participants'' rights, safety, and welfare.'),
(4, 'Evidence-Based Practice', 'The integration of the best available research evidence, professional expertise, and community needs when making decisions about health education programs.'),
(4, 'Control Group', 'In experimental research, the group that does not receive the intervention, used as a comparison to determine the effect of the program.'),
(4, 'Pre-test/Post-test Design', 'An evaluation method where participants are assessed before and after an intervention to measure changes attributable to the program.'),
(4, 'Likert Scale', 'A rating scale commonly used in surveys that asks respondents to indicate their level of agreement or disagreement with a statement, typically on a 5- or 7-point scale.'),

-- ============================================================
-- AREA 5: Advocacy
-- ============================================================
(5, 'Health Advocacy', 'The process of supporting and promoting policies, systems, and environmental changes that improve health and address health disparities.'),
(5, 'Policy Development', 'The process of creating or changing laws, regulations, organizational rules, or guidelines that influence health behaviors and outcomes.'),
(5, 'Grassroots Advocacy', 'Community-driven efforts where individuals and local groups mobilize to influence decision-makers on health-related policies and issues.'),
(5, 'Lobbying', 'Direct attempts to influence legislators or government officials to support or oppose specific legislation, subject to legal regulations for nonprofits.'),
(5, 'Health in All Policies (HiAP)', 'An approach to public policies across sectors that systematically takes into account the health implications of decisions to improve population health.'),
(5, 'Environmental Change Strategy', 'An approach that modifies the physical, social, or economic environment to make healthy choices easier and unhealthy choices more difficult.'),
(5, 'Systems Change', 'Changes to the rules, norms, policies, and practices within organizations and institutions that affect health outcomes at the population level.'),
(5, 'Social Justice', 'The principle that all people deserve equal access to opportunities, resources, and rights, particularly in health and wellbeing.'),
(5, 'Health Equity', 'The attainment of the highest level of health for all people, requiring the removal of obstacles such as poverty, discrimination, and systemic barriers.'),
(5, 'Legislative Process', 'The process by which proposed laws (bills) are introduced, debated, amended, and voted on by elected officials at local, state, or federal levels.'),
(5, 'Position Statement', 'A formal document that outlines an organization''s official stance on a particular health issue, supported by evidence and rationale.'),
(5, 'Media Advocacy', 'The strategic use of mass media and social media to advance public health policy initiatives and shape public debate on health issues.'),

-- ============================================================
-- AREA 6: Communication
-- ============================================================
(6, 'Health Communication', 'The study and use of communication strategies to inform and influence individual and community decisions that enhance health outcomes.'),
(6, 'Risk Communication', 'The exchange of real-time information, advice, and opinions between experts and people facing threats to their health, economic, or social well-being.'),
(6, 'Audience Segmentation', 'The process of dividing a target population into subgroups based on shared characteristics to develop more effective and tailored health messages.'),
(6, 'Health Marketing', 'The application of traditional marketing principles and strategies to the design, implementation, and evaluation of health communication programs.'),
(6, 'Social Marketing', 'The use of commercial marketing concepts and techniques to influence voluntary behavior change for the benefit of individuals and communities.'),
(6, 'Plain Language', 'Communication that the intended audience can understand the first time they read or hear it, avoiding jargon and using simple, clear wording.'),
(6, 'Readability', 'The ease with which a reader can understand written text, measured by formulas that consider sentence length, word complexity, and other factors.'),
(6, 'Cultural Sensitivity', 'The awareness and respect for cultural differences in communication, ensuring messages are appropriate and do not offend or exclude target audiences.'),
(6, 'Communication Channel', 'The medium through which a health message is delivered, such as print materials, social media, television, interpersonal communication, or community events.'),
(6, 'Formative Research', 'Research conducted before designing a health communication campaign to understand the target audience''s knowledge, attitudes, beliefs, and preferred communication channels.'),
(6, 'Persuasion Theory', 'Theories explaining how messages can influence attitudes and behavior, including the Elaboration Likelihood Model and social influence theories.'),
(6, 'Digital Health Literacy', 'The ability to seek, find, understand, and appraise health information from electronic sources and apply the knowledge gained to addressing health problems.'),

-- ============================================================
-- AREA 7: Leadership and Management
-- ============================================================
(7, 'Strategic Planning', 'A systematic process of defining an organization''s direction and making decisions on allocating resources to pursue health education goals.'),
(7, 'Grant Writing', 'The process of preparing a written proposal to request funding from a government agency, foundation, or other funding source for a health education program.'),
(7, 'Budget Management', 'The process of planning, organizing, and controlling financial resources allocated to a health education program to ensure efficient use of funds.'),
(7, 'Organizational Culture', 'The shared values, beliefs, norms, and practices that characterize an organization and influence how its members behave and work together.'),
(7, 'Team Building', 'Activities and strategies designed to enhance collaboration, trust, communication, and effectiveness among members of a health education team.'),
(7, 'Networking', 'The process of establishing and maintaining professional relationships with individuals and organizations to share resources, information, and support.'),
(7, 'Conflict Resolution', 'The methods and processes used to facilitate the peaceful ending of disagreements within a team or between organizations.'),
(7, 'Volunteer Management', 'The systematic process of recruiting, training, coordinating, and retaining volunteers who contribute to health education programs.'),
(7, 'Quality Assurance', 'Systematic activities implemented to ensure health education programs meet defined standards of quality and effectiveness.'),
(7, 'Professional Development', 'Ongoing learning activities that enhance a health educator''s knowledge, skills, and competencies throughout their career.'),
(7, 'Memorandum of Understanding (MOU)', 'A formal but non-binding agreement between two or more parties that outlines the terms and details of a collaborative partnership.'),
(7, 'Needs-Based Budgeting', 'A budgeting approach that allocates financial resources based on the identified needs and priorities of a health education program.'),

-- ============================================================
-- AREA 8: Ethics and Professionalism
-- ============================================================
(8, 'Code of Ethics', 'A set of principles and guidelines established by SOPHE that guides the professional conduct and ethical decision-making of health education specialists.'),
(8, 'Informed Consent', 'The ethical and legal obligation to provide participants with adequate information about a program or research study so they can make a voluntary decision to participate.'),
(8, 'Confidentiality', 'The ethical obligation to protect personal information shared by participants and ensure it is not disclosed without their permission.'),
(8, 'Autonomy', 'The ethical principle that individuals have the right to make their own decisions about their health without coercion from health educators.'),
(8, 'Beneficence', 'The ethical principle of acting in the best interest of others and taking positive steps to help and promote wellbeing.'),
(8, 'Non-maleficence', 'The ethical principle of "do no harm" — ensuring that health education interventions do not cause physical, psychological, or social harm to participants.'),
(8, 'Justice', 'The ethical principle of fair distribution of resources, benefits, and burdens across all populations, ensuring equitable access to health education.'),
(8, 'CHES Credential', 'Certified Health Education Specialist — a professional credential awarded by NCHEC to individuals who meet academic requirements and pass the certification exam.'),
(8, 'MCHES Credential', 'Master Certified Health Education Specialist — an advanced credential for health educators with at least 5 years of experience and additional continuing education.'),
(8, 'Continuing Education (CE)', 'Ongoing learning activities required to maintain CHES/MCHES certification, demonstrating continued professional growth and competency.'),
(8, 'NCHEC', 'National Commission for Health Education Credentialing — the organization that administers the CHES and MCHES certification exams and sets professional standards.'),
(8, 'SOPHE', 'Society for Public Health Education — a professional organization that promotes healthy behaviors through health education and provides the Code of Ethics for the profession.'),
(8, 'Scope of Practice', 'The boundaries within which a health education specialist is qualified to practice, defined by their education, training, and certification.'),
(8, 'Cultural Humility', 'A lifelong commitment to self-evaluation and self-critique, recognizing power imbalances and developing respectful partnerships with diverse communities.');
