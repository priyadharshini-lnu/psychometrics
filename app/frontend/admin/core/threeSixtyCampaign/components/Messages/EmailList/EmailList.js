import React, { useEffect, useState } from 'react'
import Editor from 'components/Editor'
import {
  Input, Row, Col, Button, Empty, Icon, message,
} from 'antd'
import _ from 'lodash'
import routeUtils from 'utils/routeUtils'
import cs from 'classnames'
import ErrorAlertBox from 'admin/core/threeSixtyCampaign/components/common/ErrorAlertBox'
import TitleBar from './TitleBar'
import settings from '../../../settings'
import css from './style.scss'
import TemplateMenu from './TemplateMenu'
import FooterBar from './FooterBar'

export default function Emails ({
  emailTemplates: { list },
  fetch,
  update,
  save,
  history,
  match: {
    params: { campaignId, id: selectedId },
  },
}) {
  useEffect(() => {
    fetch(campaignId)
      .then(({ response }) => {
        if (_.isUndefined(selectedId)) {
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
      .catch((errors) => {
        setErrors(errors)
      })
  }

  return (
    <Row className={css.container}>
      <Col xs={8} lg={7} xl={5}>
        <TemplateMenu emailTemplates={list} selectedId={selectedTemplate.id} />
      </Col>
      <Col xs={16} lg={17} xl={19}>
        <TitleBar emailTemplate={selectedTemplate} />
        <div className={css.content}>
          <ErrorAlertBox errors={errors} className="mtl mbl" />
          <Input
            addonBefore={I18n.t('administration.threesixty_campaigns.email_templates.from')}
            value={selectedTemplate.from}
            className={cs(['mbm', css.smallWidthInput])}
            onChange={(e) => { update(selectedTemplate.id, 'from', e.target.value) }}
          />

          <Input
            addonBefore={I18n.t('administration.threesixty_campaigns.email_templates.reply_to_email')}
            value={selectedTemplate.replyToEmail}
            className={cs(['mbm', css.smallWidthInput])}
            onChange={(e) => { update(selectedTemplate.id, 'replyToEmail', e.target.value) }}
          />

          <Input
            addonBefore={I18n.t('administration.threesixty_campaigns.email_templates.subject')}
            value={selectedTemplate.subject}
            className="mbm"
            onChange={(e) => { update(selectedTemplate.id, 'subject', e.target.value) }}
          />
          <Editor
            content={selectedTemplate.content}
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
    </Row>
  )
}
