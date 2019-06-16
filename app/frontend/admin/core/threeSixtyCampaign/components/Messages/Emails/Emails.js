import React, { useEffect, useState } from 'react'
import Editor from 'admin/core/threeSixtyCampaign/components/common/Editor'
import {
  Menu, Input, Row, Col, Button, Empty, Icon, Dropdown, message,
} from 'antd'
import _ from 'lodash'
import routeUtils from 'utils/routeUtils'
import cs from 'classnames'
import ErrorAlertBox from 'admin/core/threeSixtyCampaign/components/common/ErrorAlertBox'
import settings from '../../../settings'
import css from './style.scss'

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
    <Row style={{ minWidth: '900px' }}>
      <Col xs={8} lg={7} xl={5}>
        <TabMenu emailTemplates={list} selectedId={selectedId} />
      </Col>
      <Col xs={16} lg={17} xl={19}>
      <TitleBar selectedTemplate={selectedTemplate} />
        <div style={{ padding: '16px' }}>
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
          <FooterBar selectedTemplate={selectedTemplate} />
        </div>
      </Col>
    </Row>
  )
}

const TitleBar = ({ selectedTemplate }) => {
  const menu = (
    <Menu onClick={() => {}}>
      <Menu.Item key="schedule_email">
        Schedule Email
      </Menu.Item>
      <Menu.Item key="schedule_test_email">
        Schedule Test Email
      </Menu.Item>
    </Menu>
  )

  return (
    <div style={{backgroundColor: '#eee', padding: '10px 20px'}}>
      <div style={{display: 'inline-block'}}>
        <div style={{fontWeight: 'bold'}}>{selectedTemplate.name}</div>
        <div>Description</div>
      </div>
      <div style={{float: 'right'}}>
        <Button type="primary" size="large" style={{display: 'inline-block'}}>
          <Icon type="schedule" />
          Schedule Email
        </Button>
        <Dropdown
          className="dropdown"
          overlay={menu}
          placement="bottomLeft"
          trigger={['click']}
        >
          <Icon type="caret-down" />
        </Dropdown>
      </div>
    </div>
  )
}

const FooterBar = () => {
  return (
    <div>
      Footer
    </div>
  )
}


const TabMenu = ({emailTemplates, selectedId}) => (
  <Menu
    selectedKeys={[selectedId.toString()]}
    onClick={({ key }) => changeTemplate(key)}
    style={{ height: 700 }}
    mode="inline"
  >
    {_.map(_.groupBy(emailTemplates, 'category'), (emailTemplates, category) => (
      <Menu.ItemGroup key={category} title={_.capitalize(category)}>
        {_.map(emailTemplates, emailTemplate => (<Menu.Item key={emailTemplate.id}>{emailTemplate.name}</Menu.Item>))}
      </Menu.ItemGroup>
    ))}
  </Menu>
)
