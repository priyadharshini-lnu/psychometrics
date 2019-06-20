import React from 'react'
import {
  Menu, Button, Icon, Dropdown, Row, Col,
} from 'antd'
import css from './style.scss'

export default function TitleBar ({ emailTemplate, openModal }) {
  const menu = (
    <Menu onClick={({ key }) => openModal(key)}>
      <Menu.Item key="ScheduleEmailModal">
        {I18n.t('administration.threesixty_campaigns.email_templates.schedule_email')}
      </Menu.Item>
      <Menu.Item key="SendTestEmailModal">
        {I18n.t('administration.threesixty_campaigns.email_templates.send_test_email')}
      </Menu.Item>
    </Menu>
  )

  return (
    <div className={css.container}>
      <Row className={css.titleContainer}>
        <Col md={14} lg={16} xl={18}>
          <div className={css.title}>
            {I18n.t(`administration.threesixty_campaigns.email_templates.${emailTemplate.name}.name`)}
          </div>
          <div>
            {I18n.t(`administration.threesixty_campaigns.email_templates.${emailTemplate.name}.description`)}
          </div>
        </Col>
        <Col md={10} lg={8} xl={6}>
          {emailTemplate.schedulable && (
            <div className={css.buttonContainer}>
              <Button
                type="primary"
                size="large"
                className={css.button}
                onClick={() => openModal('SendTestEmailModal')}
              >
                <Icon type="schedule" />
                {I18n.t('administration.threesixty_campaigns.email_templates.schedule_email')}
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
          )}
        </Col>
      </Row>
    </div>
  )
}
