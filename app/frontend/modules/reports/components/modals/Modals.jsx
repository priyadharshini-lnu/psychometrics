import _ from 'lodash'
import FilterModal from './FilterModal'
import DataSheetModal from './DataSheetModal'
import AliasModal from './AliasModal'
import SavePopUp from './AliasModal/components/SavePopUp'
import DataConfigurationModal from './DataConfigurationModal'
import CPIFactorConditionModal from './CPIFactorConditionModal'
import InnovationStyleConditionModal from './InnovationStyleConditionModal'
import ConditionalFactorOccupationTextModal from './ConditionalFactorOccupationTextModal'
import ConditionalTextModal from './ConditionalTextModal'
import ConditionalImageModal from './ConditionalImageModal'
import DisplayLogic from './DisplayLogic'
import PipedTextModal from './PipedTextModal'
import { ReportSettings } from './ReportSettings'
import RemapAssessment from './RemapAssessment'
import CampaignFactorConditionModal from './CampaignFactorConditionModal'
import { GraphValueConditionModal } from './GraphValueConditionModal/GraphValueConditionModal'

const MODALS = {
  filter: FilterModal,
  dataSheetModal: DataSheetModal,
  alias: AliasModal,
  savePopUp: SavePopUp,
  dataConfiguration: DataConfigurationModal,
  CPIFactorCondition: CPIFactorConditionModal,
  innovationStyleCondition: InnovationStyleConditionModal,
  conditionalFactorOccupationText: ConditionalFactorOccupationTextModal,
  conditionalText: ConditionalTextModal,
  conditionalImage: ConditionalImageModal,
  displayLogic: DisplayLogic,
  pipedText: PipedTextModal,
  reportSettings: ReportSettings,
  remapAssessment: RemapAssessment,
  CampaignFactorCondition: CampaignFactorConditionModal,
  graphValueConditionModal: GraphValueConditionModal,
}


export default function Modals ({ current }) {
  if (!_.size(current)) return null
  return (
    <>
      {_.map(current, (modal) => {
        const ModalComponent = MODALS[modal]
        return <ModalComponent key={modal} />
      })}
    </>
  )
}
