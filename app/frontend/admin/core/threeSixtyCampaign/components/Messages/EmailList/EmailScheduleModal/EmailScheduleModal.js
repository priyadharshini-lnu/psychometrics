import React, { useState, useEffect } from 'react'
import _ from 'lodash'
import {
  Modal, Button, Icon, Input, message,
} from 'antd'
import ErrorAlertBox from 'admin/core/threeSixtyCampaign/components/common/ErrorAlertBox'
import Editor from 'components/Editor'
import cs from 'classnames'
import TitleBar from './TitleBar'
import style from './style.scss'
import ScheduledDateField from './ScheduledDateField'
import RecipientCriteriaList from './RecipientCriteriaList'

export default function EmailScheduleModal ({
  emailSchedules,
  emailSchedules: { list, selectedId },
  fetchSchedulableTemplate,
  create,
  update,
  changeSelected,
  closeModal,
  data,
  match: {
    params: { campaignId },
  },
}) {
  useEffect(() => {
    fetchSchedulableTemplate(campaignId, { selectedEmailTemplateId: data.selectedEmailTemplateId })
  }, [])

  const [errors, setErrors] = useState(null)
  const selectedEmailSchedule = _.find(list, ({ id }) => id === selectedId)

  if (!selectedEmailSchedule) {
    return null
  }

  const handleCreate = () => {
    create(campaignId, selectedEmailSchedule)
      .then(() => {
        setErrors(null)
        // closeModal()
        message.success('Email scheduled successfully', 5)
      })
      .catch(setErrors)
  }

  const handleInputChange = ({ target: { name, value } }) => {
    update(name, value)
  }

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
        <Button key="submit" type="primary" onClick={handleCreate}>
          <Icon type="check" />
          Schedule
        </Button>,
      ]}
    >
      <TitleBar emailSchedules={emailSchedules} changeSelected={changeSelected} />
      <div className={style.content}>
        <ErrorAlertBox errors={errors} className="mbl" />
        <RecipientCriteriaList emailName={selectedEmailSchedule.name} recipientCriteria={selectedEmailSchedule.recipientCriteria} />

        <ScheduledDateField
          scheduledDate={selectedEmailSchedule.scheduledDate}
          updateScheduleDate={value => update('scheduledDate', value)}
        />

        <Input
          addonBefore={I18n.t('administration.threesixty_campaigns.email_templates.from')}
          value={selectedEmailSchedule.from}
          className={cs(['mbm', style.smallWidthInput])}
          name="from"
          onChange={handleInputChange}
        />

        <Input
          addonBefore={I18n.t('administration.threesixty_campaigns.email_templates.reply_to_email')}
          value={selectedEmailSchedule.replyToEmail}
          className={cs(['mbm', style.smallWidthInput])}
          name="replyToEmail"
          onChange={handleInputChange}
        />

        <Input
          addonBefore={I18n.t('administration.threesixty_campaigns.email_templates.subject')}
          value={selectedEmailSchedule.subject}
          className="mbm"
          name="subject"
          onChange={handleInputChange}
        />
        <Editor
          type={selectedEmailSchedule.name}
          content={selectedEmailSchedule.content}
          handleContentChange={(value) => {
            update('content', value)
          }}
        />
      </div>
    </Modal>
  )
}
