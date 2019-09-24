import React, { useState, useEffect } from 'react'
import _ from 'lodash'
import {
  Modal, Button, Icon, Input, message,
} from 'antd'
import ErrorAlertBox from 'admin/core/threeSixtyCampaign/components/common/ErrorAlertBox'
import Editor from 'components/Editor'
import cs from 'classnames'
import { NAME } from 'constants/emailTemplate'
import TitleBar from './TitleBar'
import style from './style.scss'
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
  match: {
    params: { campaignId },
  },
}) {
  const [errors, setErrors] = useState(null)
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
    const save = isEdit ? update : create

    save(campaignId, emailSchedule, recipients.map(r => r.id))
      .then(() => {
        setErrors(null)
        closeModal()
        message.success('Email scheduled successfully', 5)
        if (onSave) { onSave() }
      })
      .catch(setErrors)
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

  return (
    <Modal
      width={800}
      title="Schedule Email"
      visible
      onCancel={closeModal}
      bodyStyle={{ padding: '0px' }}
      footer={[
        <Button key="back" onClick={closeModal}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          disabled={_.isNull(recipientsCount) || recipientsCount === 0}
          onClick={handleSave}
        >
          <Icon type="check" />
          Schedule
        </Button>,
      ]}
    >
      <TitleBar emailSchedules={emailSchedules} changeSelected={changeSelected} />
      <div className={style.content}>
        <ErrorAlertBox errors={errors} className="mbl" />
        <RecipientCriteriaList
          emailName={emailSchedule.name}
          recipientCriteria={emailSchedule.recipientCriteria}
          recipientType={recipientType()}
          recipientsCount={recipientsCount()}
        />

        <ScheduledDateField
          scheduledDate={emailSchedule.scheduledDate}
          updateScheduleDate={value => updateField('scheduledDate', value)}
        />

        <Input
          addonBefore={I18n.t('administration.threesixty_campaigns.email_templates.from')}
          value={emailSchedule.from}
          className={cs(['mbm', style.smallWidthInput])}
          name="from"
          onChange={handleInputChange}
        />

        <Input
          addonBefore={I18n.t('administration.threesixty_campaigns.email_templates.reply_to_email')}
          value={emailSchedule.replyToEmail}
          className={cs(['mbm', style.smallWidthInput])}
          name="replyToEmail"
          onChange={handleInputChange}
        />

        <Input
          addonBefore={I18n.t('administration.threesixty_campaigns.email_templates.subject')}
          value={emailSchedule.subject}
          className="mbm"
          name="subject"
          onChange={handleInputChange}
        />
        <Editor
          type={emailSchedule.name}
          content={emailSchedule.content}
          handleContentChange={(value) => {
            updateField('content', value)
          }}
        />
        <RecipientListModal recipientType={recipientType()} recipients={recipients} />
      </div>
    </Modal>
  )
}
