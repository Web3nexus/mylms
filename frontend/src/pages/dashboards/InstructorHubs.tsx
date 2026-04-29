import InstructorCourseSelector from '../../components/InstructorCourseSelector';

export function InstructorCoursesHub() {
  return (
    <InstructorCourseSelector 
      title="Course Management Hub" 
      subtitle="Lifecycle management and administrative oversight for your assigned academic programs."
      linkBuilder={(slug) => `/courses/${slug}/curriculum`} 
    />
  );
}

export function CurriculumMediaHub() {
  return (
    <InstructorCourseSelector 
      title="Curriculum & Media" 
      subtitle="Synthesize multimodal materials, video content, and PDF resources for your courses."
      linkBuilder={(slug) => `/courses/${slug}/curriculum`} 
    />
  );
}

export function AssignmentSetupHub() {
  return (
    <InstructorCourseSelector 
      title="Assignment Setup" 
      subtitle="Architect evaluations, peer review rules, and technical assessment standards."
      linkBuilder={(slug) => `/courses/${slug}/assignments`} 
    />
  );
}

export function QuizBuilderHub() {
  return (
    <InstructorCourseSelector 
      title="Quiz Builder Hub" 
      subtitle="Logic-driven MCQ construction and essay-based interrogation protocols."
      linkBuilder={(slug) => `/courses/${slug}/quizzes`} 
    />
  );
}

export function GradingHub() {
  return (
    <InstructorCourseSelector 
      title="Academic Gradebook" 
      subtitle="Performance validation, bulk grading protocols, and rubric synchronization."
      linkBuilder={(slug) => `/courses/${slug}/gradebook`} 
    />
  );
}

export function ForumModerationHub() {
  return (
    <InstructorCourseSelector 
      title="Forum Moderation Hub" 
      subtitle="Oversee institutional discourse and manage community discussion rooms."
      linkBuilder={(slug) => `/courses/${slug}/forums`} 
    />
  );
}
