export type DevelopmentActionLearningStyle = 'on_the_job' | 'structured_learning' | 'learning_from_others'

export type AvailableDevelopmentActions = {
    id: string | number,
    name: string,
    description: string,
    developmentActionType: string | number,
    learningStyle: DevelopmentActionLearningStyle,
    image: string | null,
    _destroy?: boolean
}


export type DevelopmentAction = {
    id: string | number;
    developmentActionId: string | number;
    name: string;
    description: string;
    userIdpSkillId: string | number;
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
    showRating?: boolean
}

export type Skill = {
    id: string | number ;
    name: string;
    description: string;
    skillType: string;
    initialRating?: number;
    finalRating?: number;
    skillId: string | number;
}

export type UserIdpSkill = Omit<Skill, 'skillType' | 'description'> & {
    skillId: string | number;
}

export type SkillWithDevelopmentActions = UserIdpSkill & {
    developmentActions: Partial<DevelopmentAction>[];
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
