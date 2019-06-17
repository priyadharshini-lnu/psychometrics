import React, { useEffect, useState } from 'react'
import Editor from 'admin/core/threeSixtyCampaign/components/common/Editor'
import {
  Input, Row, Col, Button, Empty, Icon, message,
} from 'antd'
import _ from 'lodash'
import routeUtils from 'utils/routeUtils'
import cs from 'classnames'
import ErrorAlertBox from 'admin/core/threeSixtyCampaign/components/common/ErrorAlertBox'
import I18n from 'admin/core/common/I18n'
import TitleBar from './TitleBar'
import settings from '../../../settings'
import css from './style.scss'
import TemplateMenu from './TemplateMenu'
import FooterBar from './FooterBar'

export default function Emails ({
  emailTemplates: { list, selectedId },
  fetch,
  update,
  save,
  changeSelected,
  history,
  match: {
    params: { campaignId, id },
  },
}) {
  const changeTemplate = (templateId) => {
    routeUtils.moveTo(history, settings.urlPrefix, `/messages/email/${templateId}`)
    changeSelected(templateId)
  }

  useEffect(() => {
    fetch(campaignId, { selectedId: id })
      .then(({ response }) => {
        if (_.isUndefined(id) && !_.isEmpty(response)) {
          changeTemplate(response[0].id)
        } else if (!_.isEmpty(response)) {
          changeSelected(parseInt(id, 10))
        }
      })
  }, [])

  const [errors, setErrors] = useState(null)

  const selectedTemplate = _.find(list, ({ id }) => id === selectedId)
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
        <TemplateMenu emailTemplates={list} selectedId={selectedId} changeTemplate={changeTemplate} />
      </Col>
      <Col xs={16} lg={17} xl={19}>
        <TitleBar emailTemplate={selectedTemplate} />
        <div className={css.content}>
          <ErrorAlertBox errors={errors} className="mtl mbl" />
          <Input
            addonBefore={I18n.t('administration.threesixty_campaigns.email_templates.from')}
            value={selectedTemplate.from}
            className={cs(['mbm', css.smallWidthInput])}
            onChange={(e) => { update('from', e.target.value) }}
          />

          <Input
            addonBefore={I18n.t('administration.threesixty_campaigns.email_templates.reply_to_email')}
            value={selectedTemplate.replyToEmail}
            className={cs(['mbm', css.smallWidthInput])}
            onChange={(e) => { update('replyToEmail', e.target.value) }}
          />

          <Input
            addonBefore={I18n.t('administration.threesixty_campaigns.email_templates.subject')}
            value={selectedTemplate.subject}
            className="mbm"
            onChange={(e) => { update('subject', e.target.value) }}
          />

          <Editor content={selectedTemplate.content} handleContentChange={(value) => { update('content', value) }} />
        </div>
        <FooterBar />

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
