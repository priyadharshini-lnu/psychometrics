export type AvailableDevelopmentActions = {
    id: number,
    name: string,
    description: string,
    developmentActionType: string,
    learningStyle: 'on_the_job' | 'structured_learning' | 'learning_from_others',
    image: string | null,
}

export type DevelopmentActionLearningStyle = 'on_the_job' | 'structured_learning' | 'learning_from_others'

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
    learningStyle?: 'on_the_job' | 'structured_learning' | 'learning_from_others',
    customActionLearningStyle?: DevelopmentActionLearningStyle,
    image: string | null,
    localData?: boolean,
}

export type DevelopmentActionWithSkill = DevelopmentAction & {
    skill: Skill;
}

export type Skill = {
    id: number;
    name: string;
    description: string;
    skillType: string;
    initialRating: number;
    finalRating: null | number;
}

export type UserIdpSkill = Omit<Skill, 'skillType' | 'description'> & {
    skillId: number;
}

export type SkillWithDevelopmentActions = UserIdpSkill & {
    developmentActions: DevelopmentAction[];
}

export type CategoryWithSkills = {
    skillType: string;
    skills: SkillWithDevelopmentActions[];
}

export type CategoryWithSkillsSummary = {
    skillType: string;
    skills: Skill[];
}

export type CategoryWithUserIdpSkills = {
    skillType: string;
    skills: UserIdpSkill[];
}

export type CategoryWithDevelopmentActions = {
    developmentActionType: string;
    developmentActions: DevelopmentActionWithSkill[];
}
