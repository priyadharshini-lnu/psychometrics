import React, { useEffect, useState } from 'react'
import Editor from 'admin/core/threeSixtyCampaign/components/common/Editor'
import {
  Menu, Input, Row, Col, Button, message,
} from 'antd'
import _ from 'lodash'
import routeUtils from 'utils/routeUtils'
import cs from 'classnames'
import ErrorAlertBox from 'admin/core/threeSixtyCampaign/components/common/ErrorAlertBox'
import settings from '../../../settings'
import css from './style.scss'

function Emails ({
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
        if (_.isUndefined(id)) {
          changeTemplate(response[0].id)
        } else if (!_.isEmpty(response)) {
          changeSelected(parseInt(id, 10))
        }
      })
  }, [])

  const [errors, setErrors] = useState(null)

  const selectedTemplate = _.find(list, ({ id }) => id === selectedId)
  if (_.isUndefined(selectedTemplate)) { return null }

  const groupedTemplates = _.groupBy(list, 'category')

  const renderMenu = () => (
    _.map(groupedTemplates, (emailTemplates, category) => (
      <Menu.ItemGroup key={category} title={_.capitalize(category)}>
        {_.map(emailTemplates, emailTemplate => (<Menu.Item key={emailTemplate.id}>{emailTemplate.name}</Menu.Item>))}
      </Menu.ItemGroup>
    ))
  )

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
    <Row style={{ minWidth: '900px', maxWidth: '1400px' }}>
      <Col xs={8} lg={7} xl={6}>
        <Menu
          selectedKeys={[selectedId.toString()]}
          onClick={({ key }) => changeTemplate(key)}
          style={{ width: 256, height: 700 }}
          defaultSelectedKeys={['1']}
          defaultOpenKeys={['sub1']}
          mode="inline"
        >
          {renderMenu()}
        </Menu>
      </Col>
      <Col xs={16} lg={16} xl={16}>
        <div style={{ padding: '10px' }}>
          <ErrorAlertBox errors={errors} className="mtl mbl" />
          <Input
            addonBefore="From"
            value={selectedTemplate.from}
            className={cs(['mbm', css.smallWidthInput])}
            onChange={(e) => { update('from', e.target.value) }}
          />

          <Input
            addonBefore="Reply To Email"
            value={selectedTemplate.replyToEmail}
            className={cs(['mbm', css.smallWidthInput])}
            onChange={(e) => { update('replyToEmail', e.target.value) }}
          />

          <Input
            addonBefore="Subject"
            value={selectedTemplate.subject}
            className="mbm"
            onChange={(e) => { update('subject', e.target.value) }}
          />

          <Editor content={selectedTemplate.content} handleContentChange={(value) => { update('content', value) }} />

          <Button
            type="primary"
            size="large"
            className="mtm"
            onClick={saveTemplate}
          >
              Save
          </Button>
        </div>
      </Col>
    </Row>
  )
}

export default Emails
