import TextEntry, { TextEntryResult } from './TextEntry'
import MultipleChoice, { MultipleChoiceResult } from './MultipleChoice'
import { CampaignFactorFeedback, CampaignFactorResult } from './CampaignFactorFeedback'

export const ResponseTexts = {
  TextEntry: TextEntryResult,
  MultipleChoice: MultipleChoiceResult,
  RankOrder: MultipleChoiceResult,
  CampaignFactorFeedback: CampaignFactorResult,
}

export default {
  TextEntry, MultipleChoice, RankOrder: MultipleChoice, CampaignFactorFeedback,
}
