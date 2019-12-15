import React, { useEffect, useState } from 'react'
import Editor from 'components/Editor'
import {
  Input, Row, Col, Button, Empty, Icon, message, Switch,
} from 'antd'
import _ from 'lodash'
import { CONSOLIDATED_EMAIL_NAMES } from 'constants/emailTemplate'
import routeUtils from 'utils/routeUtils'
import cs from 'classnames'
import ErrorAlertBox from 'admin/core/threeSixtyCampaign/components/common/ErrorAlertBox'
import TitleBar from './TitleBar'
import settings from '../../../settings'
import styles from './styles.scss'
import TemplateMenu from './TemplateMenu'
import FooterBar from './FooterBar'
import SentTestEmailModal from './SendTestEmailModal'
import EmailScheduleModal from './EmailScheduleModal'

export default function Emails ({
  emailTemplates: { list },
  fetch,
  update,
  save,
  openModal,
  history,
  match,
  match: {
    params: { campaignId, id: selectedId },
  },
}) {
  useEffect(() => {
    fetch(campaignId)
      .then(({ response }) => {
        if (!selectedId) {
          routeUtils.moveTo(history, settings.urlPrefix, `/messages/email/${response[0].id}`)
        }
      })
  }, [])

  const [errors, setErrors] = useState(null)

  const selectedTemplate = _.find(list, ({ id }) => id === parseInt(selectedId, 10))

  if (_.isUndefined(selectedTemplate)) { return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /> }

  const saveTemplate = () => {
    save(campaignId, selectedTemplate)
      .then(() => {
        setErrors(null)
        message.success('Template saved successfully', 5)
      })
      .catch(setErrors)
  }

  return (
    <Row className={styles.container}>
      <Col xs={8} lg={7} xl={5}>
        <TemplateMenu emailTemplates={list} selectedId={selectedTemplate.id} />
      </Col>
      <Col xs={16} lg={17} xl={19}>
        <TitleBar emailTemplate={selectedTemplate} openModal={openModal} />
        <div className={styles.content}>
          <ErrorAlertBox errors={errors} scrollToError className="mtl mbl" />
          <ConsolidatedSwitch selectedTemplate={selectedTemplate} update={update} />
          <Input
            addonBefore={I18n.t('administration.threesixty_campaigns.email_templates.from')}
            value={selectedTemplate.from}
            className={cs(['mbm', styles.smallWidthInput])}
            onChange={(e) => { update(selectedTemplate.id, 'from', e.target.value) }}
          />

          <Input
            addonBefore={I18n.t('administration.threesixty_campaigns.email_templates.reply_to_email')}
            value={selectedTemplate.replyToEmail}
            className={cs(['mbm', styles.smallWidthInput])}
            onChange={(e) => { update(selectedTemplate.id, 'replyToEmail', e.target.value) }}
          />

          <Input
            addonBefore={I18n.t('administration.threesixty_campaigns.email_templates.subject')}
            value={selectedTemplate.subject}
            className="mbm"
            onChange={(e) => { update(selectedTemplate.id, 'subject', e.target.value) }}
          />
          <Editor
            type={selectedTemplate.name}
            content={selectedTemplate.content}
            details={{ consolidation: selectedTemplate.consolidated }}
            handleContentChange={(value) => { update(selectedTemplate.id, 'content', value) }}
          />
        </div>

        <FooterBar emailTemplate={selectedTemplate} />

        <Button
          type="primary"
          size="large"
          className="mtm mll"
          onClick={saveTemplate}
        >
          <Icon type="save" />
          Save
        </Button>
      </Col>
      <SentTestEmailModal match={match} />
      <EmailScheduleModal match={match} />
    </Row>
  )
}

function ConsolidatedSwitch ({ selectedTemplate, update }) {
  if (!_.includes(CONSOLIDATED_EMAIL_NAMES, selectedTemplate.name)) {
    return null
  }

  return (
    <div className="mbm">
      <Switch
        checked={selectedTemplate.consolidated}
        onChange={(checked) => { update(selectedTemplate.id, 'consolidated', checked) }}
      />
      {'  '}
      <span>Consolidated</span>
    </div>
  )
}
