export const DUMMY_SKILLS = [
  {
    id: '1',
    name: 'Leadership',
    skill_type: 'behavioral',
    initial_rating: 3.5,
    user_idp_development_actions: [
      {
        id: 'da1',
        name: 'Lead a cross-functional project',
        description: 'Take ownership of a project involving multiple teams',
        learning_style: 'on_the_job',
        progress: 60,
        source_type: 'custom',
        start_date_time: '2026-01-15',
        end_date_time: '2026-06-30',
      },
      {
        id: 'da2',
        name: 'Complete leadership course',
        description: 'Enroll in an executive leadership program',
        learning_style: 'structured_learning',
        progress: 80,
        source_type: 'ai_generated',
        start_date_time: '2026-03-01',
        end_date_time: '2026-05-31',
      },
    ],
  },
  {
    id: '2',
    name: 'Cloud Architecture',
    skill_type: 'technical',
    initial_rating: 2.5,
    user_idp_development_actions: [
      {
        id: 'da3',
        name: 'Design a microservices solution',
        description: 'Architect a cloud-native microservices application',
        learning_style: 'on_the_job',
        progress: 55,
        source_type: 'custom',
        start_date_time: '2026-01-10',
        end_date_time: '2026-07-31',
      },
      {
        id: 'da4',
        name: 'AWS Solutions Architect certification',
        description: 'Study and pass the AWS SA Professional exam',
        learning_style: 'structured_learning',
        progress: 30,
        source_type: 'ai_generated',
        start_date_time: '2026-02-01',
        end_date_time: '2026-09-30',
      },
    ],
  },
]

export const DUMMY_REFLECTION_QUESTIONS = [
  {
    id: 'rq1',
    question: 'What are the key strengths you have identified through this development process?',
    mandatory: true,
    min_words: 50,
    max_words: 200,
    answer:
      '<p>Through this process, I have identified strong analytical thinking and the ability to break down '
      + 'complex problems into manageable steps. I also recognized my capacity to collaborate effectively '
      + 'across teams.</p>',
  },
  {
    id: 'rq2',
    question: 'How do you plan to apply your development actions in your current role?',
    mandatory: true,
    min_words: 50,
    max_words: 200,
    answer:
      '<p>I plan to take on more cross-functional projects to practice my leadership skills. '
      + 'I will also volunteer to present at department meetings to improve my communication abilities.</p>',
  },
  {
    id: 'rq3',
    question: 'What challenges did you face and how did you overcome them?',
    mandatory: false,
    min_words: null,
    max_words: null,
    answer:
      '<p>Time management was a key challenge. I overcame this by prioritizing development actions '
      + 'that aligned with my daily work, making learning a natural part of my workflow.</p>',
  },
]

export const DUMMY_USER_IDP = {
  user_idp_skills: DUMMY_SKILLS,
  reflection_questions: DUMMY_REFLECTION_QUESTIONS,
  status: 'in_progress',
  start_date: '2026-01-15',
  assigned_date: '2026-01-01',
  end_date: '2026-12-31',
  completed_date: '',
  name: 'John Doe',
  current_job_role: 'Software Engineer',
  target_job_role: 'Senior Engineer',
  division: 'Engineering',
  approval_date: '2026-01-10',
}
