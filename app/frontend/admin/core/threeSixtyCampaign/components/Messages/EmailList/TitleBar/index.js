import React from 'react'
import {
  Menu, Button, Icon, Dropdown, Row, Col,
} from 'antd'
import styles from './styles.scss'

export default function TitleBar ({ emailTemplate, openModal }) {
  const menu = (
    <Menu onClick={({ key }) => openModal(key, { selectedEmailTemplateId: emailTemplate.id })}>
      <Menu.Item key="EmailScheduleModal">
        {I18n.t('administration.threesixty_campaigns.email_templates.schedule_email')}
      </Menu.Item>
      <Menu.Item key="SendTestEmailModal">
        {I18n.t('administration.threesixty_campaigns.email_templates.send_test_email')}
      </Menu.Item>
    </Menu>
  )

  return (
    <div className={styles.container}>
      <Row className={styles.titleContainer}>
        <Col md={14} lg={16} xl={18}>
          <div className={styles.title}>
            {I18n.t(`administration.threesixty_campaigns.email_templates.${emailTemplate.name}.name`)}
          </div>
          <div>
            {I18n.t(`administration.threesixty_campaigns.email_templates.${emailTemplate.name}.description`)}
          </div>
        </Col>
        <Col md={10} lg={8} xl={6}>
          {emailTemplate.schedulable && (
            <div className={styles.buttonContainer}>
              <Button
                type="primary"
                size="large"
                className={styles.button}
                onClick={() => openModal('EmailScheduleModal', { selectedEmailTemplateId: emailTemplate.id })}
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
