import _ from 'lodash'
import Randomization from '../Randomization'
import CustomValidation from '../CustomValidation'
import DefaultValue from '../DefaultValue'
import DisplayLogic from '../DisplayLogic'
import Preview from '../Preview'
import PipedText from '../PipedTextModal'
import RichEditor from '../RichEditor'
import Flow from '../Flow'
import CreateByTemplate from '../CreateByTemplate'
import MappingNorms from '../MappingNorms'
import EndOfAssessmentModal from '../EndOfAssessmentModal'
import DataSheetModal from '../DataSheetModal'
import { SettingsModal } from '../SettingsModal'
import { LinkedAssessmentModal } from '../LinkedAssessmentModal/LinkedAssessmentModal'
import { ImportQuestionsModal } from '../ImportQuestionsModal'
import BlockSettingsModal from '../BlockSettingsModal'
import { CampaignFactorsFormModal } from '../CampaignFactorsFormModal'
import MoveQuestionModal from '../MoveQuestionModal'

const MODALS = {
  dataSheetModal: DataSheetModal,
  displayLogic: DisplayLogic,
  defaultValue: DefaultValue,
  randomization: Randomization,
  preview: Preview,
  pipedText: PipedText,
  richEditor: RichEditor,
  flow: Flow,
  customValidation: CustomValidation,
  createByTemplate: CreateByTemplate,
  mapNorms: MappingNorms,
  endOfAssessment: EndOfAssessmentModal,
  settings: SettingsModal,
  linkedAssessment: LinkedAssessmentModal,
  importQuestionsModal: ImportQuestionsModal,
  blockSettings: BlockSettingsModal,
  campaignFactorsModal: CampaignFactorsFormModal,
  moveQuestion: MoveQuestionModal,
}


export default function Modals ({ current }) {
  if (!_.size(current)) return null
  return (
    <>
      {_.map(current, (modal, index) => {
        const ModalComponent = MODALS[modal]
        return <ModalComponent key={`${modal}-${index}`} />
      })}
    </>
  )
}
