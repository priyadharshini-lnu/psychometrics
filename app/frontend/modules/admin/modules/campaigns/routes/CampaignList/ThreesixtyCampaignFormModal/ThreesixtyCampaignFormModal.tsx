import React, { useEffect, useState } from 'react'
import {
  Flex,
  Modal,
  Typography,
  App,
} from 'antd'
import {
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import connecter, { PropsFromRedux } from './connect'
import styles from './ThreesixtyCampaignFormModal.less'
import BaseSettingsForm from './BaseSettingsForm'
import AdvancedSettingsForm from './AdvancedSettingsForm'
import { useResources } from '~/hooks/useResources'
import { TYPES as THREESIXTY_TYPES } from '~/modules/admin/constants/threesixtyCampaign'
import { CampaignTemplate, Assessment } from '~/modules/admin/modules/campaigns/core/list'
import Campaign from '~/modules/admin/modules/campaigns/interfaces/Campaign'

const { I18n } = window
interface OwnProps {
  projectId: number
  close(): void
}

type Props = OwnProps & PropsFromRedux
type baseSettings = {
  name: string,
   threesixty_type: string,
   status: string,
   threesixty_category: string
  }

const ThreesixtyCampaignFormModal: React.FC<Props> = ({
  projectId,
  close,
  fetchTemplatesAndAssessments,
  addInReduxStore,
}) => {
  const { modal, message } = App.useApp()
  const [showAdvancedSettingsForm, setShowAdvancedSettingsForm] = useState(false)
  const [baseSettings, setBaseSettings] = useState< baseSettings | null>(null)
  const [campaignTemplates, setCampaignTemplates] = useState<CampaignTemplate[]>([])
  const [assessments, setAssessments] = useState<Assessment[]>([])


  const { collectionAction: createCampaign, isLoading } = useResources(
    'threesixty_campaigns',
    {
      basePath: `projects/${projectId}`,
    },
  )

  const isCreatingCampaign = isLoading('post/create_campaign')

  useEffect(() => {
    fetchTemplatesAndAssessments(projectId).then(
      ({ response: { templates, assessments } }) => {
        setCampaignTemplates(templates)
        setAssessments(assessments)
      },
    )
  }, [])

  const handleBaseSettingsFinish = (values) => {
    if (isCreatingCampaign) return

    setBaseSettings(values)
    if (values.threesixty_type === THREESIXTY_TYPES.EMPTY) {
      createCampaign({
        action: 'create_campaign',
        method: 'post',
        body: values,
      }).then((data: Campaign) => {
        addInReduxStore(data)
        message.success(I18n.t('administration.campaigns.modals.create_threesixity.success'))
        close()
      })
      setShowAdvancedSettingsForm(false)
    } else if (values.threesixty_type === THREESIXTY_TYPES.PREVIOUS_360) {
      createCampaign({
        action: 'create_campaign',
        method: 'post',
        body: values,
      }).then((result) => {
        if (result === 'ok') {
          message.success(I18n.t('administration.campaigns.modals.create_threesixity.success_job'))
          close()
        }
      })
    } else {
      setShowAdvancedSettingsForm(true)
    }
  }

  const handleBack = () => {
    setShowAdvancedSettingsForm(false)
  }

  const handlesAdvancedSettingsFinish = (data) => {
    if (isCreatingCampaign) return

    const body = {
      ...baseSettings,
      ...data,
    }
    createCampaign({
      action: 'create_campaign',
      method: 'post',
      body,
    }).then(() => {
      message.success(I18n.t('administration.campaigns.modals.create_threesixity.success_job'))
      close()
    })
  }

  const handleClose = () => {
    if (showAdvancedSettingsForm) {
      modal.confirm({
        title: I18n.t('administration.campaigns.modals.create_threesixity.close.title'),
        content: I18n.t(
          'administration.campaigns.modals.create_threesixity.close.content',
        ),
        icon: <ExclamationCircleOutlined />,
        okType: 'danger',
        cancelText: I18n.t(
          'administration.common.cancel',
        ),
        onOk: () => {
          close()
        },
      })
    } else {
      close()
    }
  }

  return (
    <Modal
      width="100%"
      title={(
        <Typography.Title level={3} style={{ margin: 0 }}>
          {I18n.t('administration.campaigns.menus.add_multi_rater_campaign')}
        </Typography.Title>
      )}
      open
      onCancel={handleClose}
      footer={null}
      className={styles.modal}
      styles={{ header: { padding: '16px 16px 8px 16px' } }}
      classNames={{ body: styles.modalBody }}
    >
      <Flex vertical className="h-100">
        {showAdvancedSettingsForm ? (
          <AdvancedSettingsForm
            projectId={projectId}
            onClose={handleClose}
            onBack={handleBack}
            onFinish={handlesAdvancedSettingsFinish}
            campaignTemplates={campaignTemplates}
            isSubmitting={isCreatingCampaign}
          />
        ) : (
          <BaseSettingsForm
            initialSettings={baseSettings}
            assessments={assessments}
            onClose={close}
            onFinish={handleBaseSettingsFinish}
            isSubmitting={isCreatingCampaign}
          />
        )}
      </Flex>
    </Modal>
  )
}

export default connecter(ThreesixtyCampaignFormModal)
