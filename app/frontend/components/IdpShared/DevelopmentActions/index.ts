export { DevelopmentActionListView } from './DevelopmentActionListView'
export { DevelopmentActionBoardView } from './DevelopmentActionBoardView'

export type AvailableDevelopmentActions = {
  id: number,
  name: string,
  description: string,
  category: string,
  learningStyle: 'on_the_job' | 'structured_learning' | 'learning_from_the_others',
  image: string | null,
}

export type DevelopmentAction = {
  id: number;
  developmentActionId: number;
  name: string;
  description: string;
  userIdpSkillId: number;
  customAction: null | string;
  progress: number;
  startDateTime: null | string;
  endDateTime: null | string;
  private: boolean;
  learningStyle: 'on_the_job' | 'structured_learning' | 'learning_from_the_others',
  image: string | null,
}

export type DevelopmentActionWithSkill = DevelopmentAction & {
  skill: Skill;
}

export type Skill = {
  id: number;
  name: string;
  description: string;
  category: string;
  initialRating: number;
  finalRating: null | number;
}

export type SkillWithDevelopmentActions = Skill & {
  development_actions: DevelopmentAction[];
}

export type CategoryWithSkills = {
  category: string;
  skills: SkillWithDevelopmentActions[];
}

export type CategoryWithDevelopmentActions = {
  category: string;
  developmentActions: DevelopmentActionWithSkill[];
}
