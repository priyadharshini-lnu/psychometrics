import {
  Menu, Button, Dropdown, Row, Col,
} from 'antd'
import { ScheduleOutlined, CaretDownOutlined } from '@ant-design/icons'
import styles from './styles.less'

export default function TitleBar ({ emailTemplate, openModal }) {
  const menuItems = [
    { key: 'EmailScheduleModal', label: I18n.t('administration.threesixty_campaigns.email_templates.schedule_email') },
    { key: 'SendTestEmailModal', label: I18n.t('administration.threesixty_campaigns.email_templates.send_test_email') },
  ]
  const menu = (
    <Menu items={menuItems} onClick={({ key }) => openModal(key, { selectedEmailTemplateId: emailTemplate.id })} />
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
                <ScheduleOutlined />
                {I18n.t('administration.threesixty_campaigns.email_templates.schedule_email')}
              </Button>
              <Dropdown
                className="dropdown"
                overlay={menu}
                placement="bottomLeft"
                trigger={['click']}
              >
                <CaretDownOutlined />
              </Dropdown>
            </div>
          )}
        </Col>
      </Row>
    </div>
  )
}
