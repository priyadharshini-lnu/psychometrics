import { FC } from 'react'
import { Modal } from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import { CampaignFactorsForm } from '~/components/CampaignFactorsForm'
import { saveCampaignFactors } from '~/modules/survey/core/builder/assessment/actions'
import { closeModal } from '~/modules/admin/core/ui/modals'
import { RootState } from '../../core/rootReducers'

const connector = connect(
  (state: RootState) => ({
    columns: state.survey.builder.assessment.campaign_factors_list,
  }),
  {
    saveCampaignFactors,
    closeModal,
  },
)

type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux

export const CampaignFactorsModalComponent:FC<Props> = ({ columns, saveCampaignFactors, closeModal }) => (
  <Modal
    width={700}
    title="Campaign Factors"
    open
    onCancel={closeModal}
    footer={null}
    destroyOnClose
  >
    <CampaignFactorsForm
      factors={columns}
      saveCampaignFactors={saveCampaignFactors}
      onSaveCampaignFactors={closeModal}
    />
  </Modal>

)


export const CampaignFactorsFormModal = connector(CampaignFactorsModalComponent)
