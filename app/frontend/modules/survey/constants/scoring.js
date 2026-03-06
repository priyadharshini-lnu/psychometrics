export const SCORING = 'Scoring'
export const RECODING = 'Recoding'
export const AI_SCORE_CONFIG_TYPES = {
  WHAT_TO_LOOK_FOR: 'what_to_look_for',
  SCORE_DEFINITIONS: 'score_definitions',
}
export const TRASCRIPTION_ENABLED_QUESTIONS = { AudioResponse: true, VideoResponse: true }
const AI_ENABLED_TEXT_ENTRY_TYPES = {
  MultiLine: true, EssayTextBox: true, SingleLine: true, RichText: true,
}
export const AI_SCORING_ENABLED_QUESTIONS = {
  AudioResponse: true,
  VideoResponse: true,
  TextEntry: { ...AI_ENABLED_TEXT_ENTRY_TYPES },
}
export const ENHANCE_WITH_AI_ENABLED_QUESTIONS = { TextEntry: { ...AI_ENABLED_TEXT_ENTRY_TYPES } }
