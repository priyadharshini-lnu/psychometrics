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
import CampaignFactorsModal from './CampaignFactorsModal'
import RemapAssessment from './RemapAssessment'

const MODALS = {
  filter: FilterModal,
  dataSheetModal: DataSheetModal,
  campaignFactorsModal: CampaignFactorsModal,
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
  remapAssessment: RemapAssessment,
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
