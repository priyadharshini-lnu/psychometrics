import {
  useContext,
} from 'react'
import {
  Flex, Typography, Row, Col,
} from 'antd'
import { MediaQueryContext } from '~/glint'
import {
  BulbOutlined, UserOutlined, CloudOutlined, CheckOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import styles from './styles.less'
import commonStyles from '../common-styles.less'

const { I18n } = window

export const MiddleSection = () => {
  const { isTablet, isDesktop } = useContext(MediaQueryContext)

  return (
    <Flex
      vertical
      className={styles['top-border-colored-card']}
      gap={16}
    >
      <Row gutter={[32, 16]}>
        <Col span={24} style={{ paddingInline: '24px' }}>
          <Row>
            <Col style={{ paddingInlineEnd: '0.5rem' }}>
              <BulbOutlined style={{ fontSize: '1.5rem', color: 'var(--ant-primary-color)' }} />
            </Col>
            <Col>
              <Typography.Text style={{ fontWeight: '700', verticalAlign: 'top' }}>
                {I18n.t('enduser.before_you_begin')}
              </Typography.Text>
            </Col>
          </Row>
        </Col>
      </Row>

      <Row gutter={[32, 16]}>
        <Col span={24} style={{ paddingInline: '24px' }}>
          <Typography.Text>{I18n.t('enduser.instruction')}</Typography.Text>
        </Col>
      </Row>

      <Row
        gutter={[32, 16]}
        style={{
          paddingInlineStart: '1rem',
          paddingInlineEnd: '1rem',
        }}
      >
        <Col span={isTablet || isDesktop ? 24 : 12}>
          <Row
            className={`${styles['top-border-colored-card']} ${commonStyles['bg-off-white']}`}
            gutter={[16, 16]}
          >
            <Col span={24}>
              <CloudOutlined style={{
                fontSize: '1rem',
                marginInlineEnd: '0.5rem',
                color: 'var(--ant-primary-color)',
              }}
              />
              <Typography.Text style={{ fontWeight: '700' }}>
                {I18n.t('enduser.environment_setup')}

              </Typography.Text>
            </Col>

            <Col span={24}>
              <CheckOutlined style={{
                fontSize: '1rem',
                marginInlineEnd: '0.5rem',
                color: 'var(--ant-primary-color)',
              }}
              />
              <Typography.Text>{I18n.t('enduser.subinstruction_one')}</Typography.Text>
            </Col>

            <Col span={24}>
              <CheckOutlined style={{
                fontSize: '1rem',
                marginInlineEnd: '0.5rem',
                color: 'var(--ant-primary-color)',
              }}
              />
              <Typography.Text>{I18n.t('enduser.subinstruction_two')}</Typography.Text>
            </Col>

            <Col span={24}>
              <CheckOutlined style={{
                fontSize: '1rem',
                marginInlineEnd: '0.5rem',
                color: 'var(--ant-primary-color)',
              }}
              />
              <Typography.Text>{I18n.t('enduser.subinstruction_three')}</Typography.Text>
            </Col>

            <Col span={24}>
              <CheckOutlined style={{
                fontSize: '1rem',
                marginInlineEnd: '0.5rem',
                color: 'var(--ant-primary-color)',
              }}
              />
              <Typography.Text>{I18n.t('enduser.subinstruction_four')}</Typography.Text>
            </Col>

            <Col span={24}>
              <CheckOutlined style={{
                fontSize: '1rem',
                marginInlineEnd: '0.5rem',
                color: 'var(--ant-primary-color)',
              }}
              />
              <Typography.Text>{I18n.t('enduser.subinstruction_five')}</Typography.Text>
            </Col>
          </Row>
        </Col>

        <Col span={isTablet || isDesktop ? 24 : 12}>
          <Row
            className={`${styles['top-border-colored-card']} ${commonStyles['bg-off-white']}`}
            gutter={[16, 16]}
          >
            <Col span={24}>
              <UserOutlined style={{
                fontSize: '1rem',
                marginInlineEnd: '0.5rem',
                color: 'var(--ant-primary-color)',
              }}
              />
              <Typography.Text style={{ fontWeight: '700' }}>
                {I18n.t('enduser.personal_readiness')}
              </Typography.Text>
            </Col>

            <Col span={24}>
              <CheckOutlined style={{
                fontSize: '1rem',
                marginInlineEnd: '0.5rem',
                color: 'var(--ant-primary-color)',
              }}
              />
              <Typography.Text>{I18n.t('enduser.subinstruction_six')}</Typography.Text>
            </Col>

            <Col span={24}>
              <CheckOutlined style={{
                fontSize: '1rem',
                marginInlineEnd: '0.5rem',
                color: 'var(--ant-primary-color)',
              }}
              />
              <Typography.Text>{I18n.t('enduser.subinstruction_seven')}</Typography.Text>
            </Col>

            <Col span={24} style={{ height: '100%' }}>
              <CheckOutlined style={{
                fontSize: '1rem',
                marginInlineEnd: '0.5rem',
                color: 'var(--ant-primary-color)',
              }}
              />
              <Typography.Text>{I18n.t('enduser.subinstruction_eight')}</Typography.Text>
            </Col>
          </Row>
        </Col>
      </Row>
    </Flex>
  )
}
