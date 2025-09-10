import jobIcon from '~/modules/idpReport/assets/LearningJob.svg'
import collaborativeIcon from '~/modules/idpReport/assets/CollaborativeLearning.svg'
import learningIcon from '~/modules/idpReport/assets/FormalLearning.svg'
import idpLibraryLogo from '~/modules/idpReport/assets/IDPLibrary.svg'
import customDALogo from '~/modules/idpReport/assets/Custom.svg'
import generativeAILogo from '~/modules/idpReport/assets/GenerativeAi.svg'

export const DEVELOPMENT_ACTION_LEARNING_STYLE = [
  'on_the_job',
  'learning_from_others',
  'structured_learning',
]

const learningStyleBorderColor = {
  on_the_job: 'var(--blue-bg)',
  structured_learning: 'var(--grey-border)',
  learning_from_others: 'var(--bright-green-bg)',
}

const { I18n } = window

export const developmentActionLearningStylesConfig = {
  on_the_job: {
    duration: 70,
    text: I18n.t('idp.development_actions.learning_on_the_job_label'),
    borderColor: learningStyleBorderColor.on_the_job,
    logo: jobIcon,
  },
  structured_learning: {
    duration: 20,
    text: I18n.t('idp.development_actions.structured_learning_label'),
    borderColor: learningStyleBorderColor.structured_learning,
    logo: learningIcon,
  },
  learning_from_others: {
    duration: 10,
    text: I18n.t('idp.development_actions.learning_from_others_label'),
    borderColor: learningStyleBorderColor.learning_from_others,
    logo: collaborativeIcon,
  },
}

export enum DevelopmentActionSourceType {
  PLATFORM = 'platform',
  AI_GENERATED = 'ai_generated',
  CUSTOM = 'custom',
}

export const sourceTypeConfig = {
  [DevelopmentActionSourceType.PLATFORM]: {
    label: I18n.t('idp.development_actions.idp_library'),
    icon: idpLibraryLogo,
  },
  [DevelopmentActionSourceType.CUSTOM]: {
    label: I18n.t('idp.development_actions.custom'),
    icon: customDALogo,
  },
  [DevelopmentActionSourceType.AI_GENERATED]: {
    label: I18n.t('idp.development_actions.generative_ai'),
    icon: generativeAILogo,
  },
}
