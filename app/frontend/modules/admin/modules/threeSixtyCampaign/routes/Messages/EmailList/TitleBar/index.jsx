import { useState } from 'react'
import {
  Button, Dropdown, Row, Col, Flex, Space,
} from 'antd'
import { ScheduleOutlined, CaretDownOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import styles from './styles.less'

export default function TitleBar ({ emailTemplate, openModal }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const menuItems = [
    { key: 'EmailScheduleModal', label: I18n.t('admin.schedule_email') },
    { key: 'SendTestEmailModal', label: I18n.t('admin.send_test_email') },
  ]

  return (
    <div className={styles.container}>
      <Row className={styles.titleContainer}>
        <Col md={14} lg={16} xl={18}>
          <div className={styles.title}>
            {I18n.t(`admin.${emailTemplate.name}_name`)}
          </div>
          <div>
            {I18n.t(`admin.${emailTemplate.name}_description`)}
          </div>
        </Col>
        <Col md={10} lg={8} xl={6}>
          {emailTemplate.schedulable && (
            <Flex justify="flex-end">
              <Space.Compact>
                <Button
                  type="primary"
                  size="large"
                  icon={<ScheduleOutlined />}
                  onClick={() => openModal('EmailScheduleModal', { selectedEmailTemplateId: emailTemplate.id })}
                >
                  {I18n.t('admin.schedule_email')}
                </Button>
                <Dropdown
                  menu={{
                    items: menuItems,
                    onClick: ({ key }) => openModal(key, { selectedEmailTemplateId: emailTemplate.id }),
                  }}
                  placement="bottomRight"
                  trigger={['click']}
                  open={menuOpen}
                  onOpenChange={setMenuOpen}
                >
                  <Button
                    type="primary"
                    size="large"
                    icon={<CaretDownOutlined />}
                    aria-label={I18n.t('shared.more_actions')}
                    aria-haspopup="menu"
                    aria-expanded={menuOpen}
                  />
                </Dropdown>
              </Space.Compact>
            </Flex>
          )}
        </Col>
      </Row>
    </div>
  )
}
