import React, { useEffect, useState, useMemo } from 'react'
import {
  Flex,
  Modal,
  Typography,
  App,
} from 'antd'
import {
  ExclamationCircleOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import connecter, { PropsFromRedux } from './connect'
import styles from './ThreesixtyCampaignFormModal.less'
import BaseSettingsForm from './BaseSettingsForm'
import AdvancedSettingsForm from './AdvancedSettingsForm'
import { useResources } from '~/hooks/useResources'
import { THREESIXTY_CATEGORY, TYPES as THREESIXTY_TYPES } from '~/modules/admin/constants/threesixtyCampaign'
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
  threesixty_category: string,
  default_assessment_locale?: string,
  default_report_language?: string,
  tagList?: string[],
}

const ThreesixtyCampaignFormModal: React.FC<Props> = ({
  projectId,
  close,
  fetchTemplatesAndAssessments,
  features,
  addInReduxStore,
}) => {
  const { modal, message } = App.useApp()
  const [showAdvancedSettingsForm, setShowAdvancedSettingsForm] = useState(false)
  const [baseSettings, setBaseSettings] = useState< baseSettings | null>(null)
  const [campaignTemplates, setCampaignTemplates] = useState<CampaignTemplate[]>([])
  const [assessments, setAssessments] = useState<Assessment[]>([])

  const filteredCampaignTemplates = useMemo(() => {
    if (!baseSettings) return campaignTemplates
    return campaignTemplates.filter(
      campaignTemplate => (baseSettings.threesixty_category === THREESIXTY_CATEGORY.SKILLS_RATER
        ? campaignTemplate.skillRater
        : !campaignTemplate.skillRater),
    )
  }, [baseSettings, campaignTemplates])

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
        message.success(I18n.t('admin.threesixity_success'))
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
          message.success(I18n.t('admin.threesixity_success_job'))
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
      message.success(I18n.t('admin.threesixity_success_job'))
      close()
    })
  }

  const handleClose = () => {
    if (showAdvancedSettingsForm) {
      modal.confirm({
        title: I18n.t('admin.threesixity_close_title'),
        content: I18n.t(
          'admin.threesixity_close_content',
        ),
        icon: <ExclamationCircleOutlined />,
        okType: 'danger',
        cancelText: I18n.t(
          'shared.cancel',
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
          {I18n.t('admin.campaigns_menus_add_multi_rater_campaign')}
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
            campaignTemplates={filteredCampaignTemplates}
            isSubmitting={isCreatingCampaign}
          />
        ) : (
          <BaseSettingsForm
            initialSettings={baseSettings}
            assessments={assessments}
            features={features}
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
