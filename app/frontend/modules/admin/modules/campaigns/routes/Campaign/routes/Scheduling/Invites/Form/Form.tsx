import { useEffect, useState } from 'react'
import {
  Form, Row, Col, Steps, App,
} from 'antd'
import _ from 'lodash'
import { useNavigate, useParams } from 'react-router-dom'
import { WorkshopInvite } from '~/modules/admin/modules/campaigns/core/invites'
import routeUtils from '~/utils/route'
import { useResources } from '~/hooks/useResources'
import styles from './Form.less'
import { BaseInfoForm, type Errors } from './BaseInfo'
import { AddSubjects } from './AddSubjects'
import { SendInvitation } from './SendInvitations'
import { SuccessPage } from './SuccessPage'
import settings from '~/modules/admin/modules/campaigns/settings'

const { I18n } = window

export const InvitesForm = () => {
  const {
    campaignId,
  } = useParams() as { campaignId: string }
  const prefixPath = `${settings.urlPrefix}/${campaignId}/scheduling`
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [submitPage, showSubmitPage] = useState(false)
  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState<Errors | null>(null)
  const { modal } = App.useApp()

  useEffect(() => {
    form.setFieldsValue({
      allowLanguagePreference: false,
      allowedLanguages: [],
      allowNeurodiversityOption: false,
    })
  }, [])

  const { createResource, isLoading } = useResources<WorkshopInvite>('workshop_invites', {
    basePath: `/campaigns/${campaignId}`,
  })

  const submitForm = () => {
    setErrors(null)
    createResource({
      name: form.getFieldValue('name'),
      title: form.getFieldValue('title'),
      allowLanguagePreference: form.getFieldValue('allowLanguagePreference'),
      allowedLanguages: form.getFieldValue('languagesAllowed'),
      allowNeurodiversityOption: form.getFieldValue('allowNeurodiversityOption'),
      workshopIds: (form.getFieldValue('workshopIds') || []).map(workshop => workshop.id),
      subjects: (form.getFieldValue('subjects') || []).map(user => ({ userId: user.id })),
      campaignAssessmentGroupId: form.getFieldValue('campaignAssessmentGroupId'),
      translations: form.getFieldValue('translations') || [],
    }).then(() => {
      showSubmitPage(true)
    }).catch((errors) => {
      setErrors(errors)
    })
  }

  const handleCancel = () => {
    modal.confirm({
      title: I18n.t('admin.cancel_confirmation_title'),
      content: I18n.t('admin.cancel_confirmation_message'),
      okText: I18n.t('shared.confirm'),
      cancelText: I18n.t('shared.cancel'),
      onOk: () => routeUtils.moveTo(navigate, prefixPath, '/invites'),
    })
  }

  return (
    <div style={{ padding: 20 }}>
      <Row className={styles.steps}>
        <Col span={18}>
          <Steps
            size="small"
            current={step}
            items={[
              {
                title: I18n.t('admin.invite_steps_basic_info'),
                ...(errors?.workshopIds ? {
                  description: I18n.t('admin.invite_steps_has_errors'),
                  status: 'error',
                  onClick: () => { errors?.workshopIds && setStep(0) },
                } : {}),
              },
              {
                title: I18n.t('admin.invite_steps_add_subjects'),
                ...(errors?.subjects ? {
                  description: I18n.t('admin.invite_steps_has_errors'),
                  status: 'error',
                  onClick: () => { setStep(1) },
                } : {}),
              },
              {
                title: I18n.t('admin.invite_steps_send_invitation'),
                ...(_.some(errors, (e, key) => key.includes('translations')) ? {
                  description: I18n.t('admin.invite_steps_has_errors'),
                  status: 'error',
                  onClick: () => { setStep(2) },
                } : {}),
              },
            ]}
          />
        </Col>
      </Row>
      {step === 0 && (
        <BaseInfoForm
          onCancel={handleCancel}
          form={form}
          next={() => setStep(step + 1)}
          errors={errors}
        />
      )}
      {step === 1 && (
        <AddSubjects
          form={form}
          onCancel={handleCancel}
          next={() => setStep(step + 1)}
          prev={() => setStep(step - 1)}
        />
      )}
      {step === 2 && (submitPage
        ? <SuccessPage />
        : (
          <SendInvitation
            form={form}
            submit={submitForm}
            prev={() => setStep(step - 1)}
            errors={errors}
            onCancel={handleCancel}
            isLoading={isLoading('add')}
          />
        ))}
    </div>
  )
}
