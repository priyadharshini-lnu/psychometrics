import { PlanChangeStatus } from '~/modules/endUser/modules/campaigns/core/idp/utils'

export type DevelopmentActionLearningStyle = 'on_the_job' | 'structured_learning' | 'learning_from_others'
export type SourceType = 'platform' | 'custom' | 'ai_generated'

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
    learningStyle: DevelopmentActionLearningStyle,
    customActionLearningStyle?: DevelopmentActionLearningStyle,
    image: string | null,
    localData?: boolean,
    changeStatus? : 'added' | 'edited' ;
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
    private: boolean
    deletedAt: string | null;
}

export type UserIdpSkill = Omit<Skill, 'description'> & {
    skillId: string | number;
    changeStatus? : PlanChangeStatus.ADDED | PlanChangeStatus.EDITED | PlanChangeStatus.REMOVED ;
    changeHistory? : {
        addedDA: string[];
        removedDA: string[];
        updatedDA: string[];
    };
}

export type SkillWithDevelopmentActions = UserIdpSkill & {
    developmentActions: Partial<DevelopmentAction>[];
}

export type TypeWithSkills = {
    skillType: string;
    skills: SkillWithDevelopmentActions[];
}

export type TypeWithSkillsSummary = {
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
