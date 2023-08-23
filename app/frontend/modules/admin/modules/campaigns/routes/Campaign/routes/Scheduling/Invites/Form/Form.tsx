import { useEffect, useState } from 'react'
import {
  Form, Row, Col, Steps, Button,
} from 'antd'
import { useHistory, useParams } from 'react-router-dom'
import { WorkshopInvite } from 'modules/admin/modules/campaigns/core/invites'
import { useResources } from '~/hooks/useResources'
import styles from './Form.less'
import { BaseInfoForm } from './BaseInfo'
import { AddSubjects } from './AddSubjects'
import { SendInvitation } from './SendInvitations'
import { SuccessPage } from './SuccessPage'
import { DirectionalNavigateBackIcon } from '~/glint'

const { I18n } = window

export const InvitesForm = () => {
  const history = useHistory()
  const [form] = Form.useForm()
  const [submitPage, showSubmitPage] = useState(false)
  const [step, setStep] = useState(0)
  const params = useParams<{campaignId: string}>()

  useEffect(() => {
    form.setFieldsValue({
      allowLanguagePreference: true,
      allowedLanguages: [],
      allowNeurodiversityOption: false,
    })
  }, [])

  const { createResource } = useResources<WorkshopInvite>('workshop_invites')

  const submitForm = () => {
    createResource({
      campaignId: params.campaignId,
      title: form.getFieldValue('title'),
      allowLanguagePreference: form.getFieldValue('allowLanguagePreference'),
      allowedLanguages: ['en', 'ar'],
      allowNeurodiversityOption: form.getFieldValue('allowNeurodiversityOption'),
      workshopIds: (form.getFieldValue('workshopIds') || []).map(workshop => workshop.id),
      subjects: (form.getFieldValue('subjects') || []).map(user => ({ userId: user.id })),
      translations: form.getFieldValue('translations') || [],
    }, { apiConfig: { filter: { workshops_campaign_id_eq: params.campaignId } } }).then(() => {
      showSubmitPage(true)
    })
  }

  return (
    <div style={{ padding: 20 }}>
      <Row className={styles.steps}>
        <Button type="link" onClick={() => history.goBack()}><DirectionalNavigateBackIcon /></Button>
        <Col span={12}>
          <Steps
            current={step}
            items={[
              {
                title: I18n.t('administration.assessment_center.invite.steps.basic_info'),
              },
              {
                title: I18n.t('administration.assessment_center.invite.steps.add_subjects'),
              },
              {
                title: I18n.t('administration.assessment_center.invite.steps.send_invitation'),
              },
            ]}
          />
        </Col>
      </Row>
      {step === 0 && <BaseInfoForm form={form} next={() => setStep(step + 1)} />}
      {step === 1 && <AddSubjects form={form} next={() => setStep(step + 1)} prev={() => setStep(step - 1)} />}
      {step === 2 && (submitPage
        ? <SuccessPage />
        : <SendInvitation form={form} submit={submitForm} prev={() => setStep(step - 1)} />)}
    </div>
  )
}
