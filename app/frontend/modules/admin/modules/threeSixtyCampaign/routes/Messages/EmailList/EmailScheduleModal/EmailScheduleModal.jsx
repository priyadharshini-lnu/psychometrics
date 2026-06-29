import { useState, useEffect } from 'react'
import _ from 'lodash'
import {
  Modal, Button, Input, App, Switch,
} from 'antd'
import cs from 'classnames'
import { useParams } from 'react-router-dom'
import { CheckOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { NAME, CONSOLIDATED_EMAIL_NAMES } from '~/modules/admin/constants/emailTemplate'
import ErrorAlertBox from '~/components/ErrorAlertBox'
import EmailEditor from '~/components/EmailEditor'
import TitleBar from './TitleBar'
import styles from './styles.less'
import ScheduledDateField from './ScheduledDateField'
import RecipientCriteriaList from './RecipientCriteriaList'
import RecipientListModal from './RecipientListModal'

export default function EmailScheduleModal ({
  emailSchedules,
  emailSchedules: { list, selectedId, recipients },
  fetchSingle,
  fetchSchedulableTemplate,
  create,
  update,
  updateField,
  changeSelected,
  closeModal,
  data,
  onSave,
}) {
  const { campaignId } = useParams()
  const [errors, setErrors] = useState(null)
  const [loading, setLoading] = useState(false)
  const { message } = App.useApp()
  const emailSchedule = _.find(list, ({ id }) => id === selectedId)
  const isEdit = !!data.selectedEmailScheduleId

  useEffect(() => {
    if (isEdit) {
      fetchSingle(campaignId, data.selectedEmailScheduleId)
    } else {
      fetchSchedulableTemplate(campaignId, { selectedEmailTemplateId: data.selectedEmailTemplateId })
    }
  }, [])

  if (!emailSchedule) {
    return null
  }

  const handleSave = () => {
    setLoading(true)
    const save = isEdit ? update : create

    save(campaignId, emailSchedule, recipients.map(r => r.id))
      .then(() => {
        setErrors(null)
        closeModal('EmailScheduleModal')
        message.success('Email scheduled successfully', 5)
        if (onSave) { onSave() }
      })
      .catch(setErrors)
      .finally(() => setLoading(false))
  }

  const handleInputChange = ({ target: { name, value } }) => {
    updateField(name, value)
  }

  const recipientType = () => {
    if (_.includes([NAME.SUBJECT_INVITE, NAME.SUBJECT_REMINDER], emailSchedule.name)) {
      return 'Subject'
    }
    if (_.includes([NAME.EVALUATOR_INVITE, NAME.EVALUATOR_REMINDER], emailSchedule.name)) {
      return 'Evaluator'
    }

    return 'Participant'
  }

  const recipientsCount = () => (recipients ? recipients.length : null)
  const updateConsolidationField = value => updateField('consolidated', value)

  return (
    <Modal
      width={800}
      title={I18n.t('admin.schedule_email_title')}
      open
      onCancel={closeModal}
      bodyStyle={{ padding: '0px' }}
      footer={[
        <Button key="back" onClick={closeModal}>
          {I18n.t('shared.cancel')}
        </Button>,
        <Button
          key="submit"
          type="primary"
          disabled={loading || _.isNull(recipientsCount) || recipientsCount === 0}
          onClick={handleSave}
          loading={loading}
        >
          <CheckOutlined />
          {I18n.t('admin.schedule')}
        </Button>,
      ]}
    >
      <TitleBar emailSchedules={emailSchedules} changeSelected={changeSelected} />
      <div className={styles.content}>
        <ErrorAlertBox
          errors={errors}
          scrollToError
          scrollView={document.getElementsByClassName('ant-modal-wrap')[0]}
          className="mbl"
        />
        <RecipientCriteriaList
          emailName={emailSchedule.name}
          recipientCriteria={emailSchedule.recipientCriteria}
          recipientType={recipientType()}
          recipientsCount={recipientsCount()}
        />
        <ConsolidatedSwitch emailTemplate={emailSchedule} update={updateConsolidationField} />
        <ScheduledDateField
          scheduledDate={emailSchedule.scheduledDate}
          updateScheduleDate={value => updateField('scheduledDate', value)}
        />

        <Input
          addonBefore={I18n.t('admin.from')}
          value={emailSchedule.from}
          className={cs(['mbm', styles.smallWidthInput])}
          name="from"
          onChange={handleInputChange}
        />

        <Input
          addonBefore={I18n.t('admin.reply_to_email')}
          value={emailSchedule.replyToEmail}
          className={cs(['mbm', styles.smallWidthInput])}
          name="replyToEmail"
          onChange={handleInputChange}
        />

        <Input
          addonBefore={I18n.t('admin.subject')}
          value={emailSchedule.subject}
          className="mbm"
          name="subject"
          onChange={handleInputChange}
        />
        <EmailEditor
          withPipedText
          type={emailSchedule.name}
          content={emailSchedule.content}
          details={{ consolidation: emailSchedule.consolidated }}
          handleContentChange={(value) => {
            updateField('content', value)
          }}
        />
        <RecipientListModal recipientType={recipientType()} recipients={recipients} />
      </div>
    </Modal>
  )
}


function ConsolidatedSwitch ({ emailTemplate, update }) {
  if (!_.includes(CONSOLIDATED_EMAIL_NAMES, emailTemplate.name)) {
    return null
  }

  return (
    <div className="mbm">
      <Switch
        checked={emailTemplate.consolidated}
        onChange={update}
      />
      {'  '}
      <span>{I18n.t('admin.consolidated')}</span>
    </div>
  )
}
