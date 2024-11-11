import React from 'react'
import {
  Form, Layout, Typography, Input, Row, Col, Space, Button,
} from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'
import { connect, ConnectedProps } from 'react-redux'
import { DirectionalArrowIcon, PageHeader as GlintPageHeader } from '~/glint'
import ResourceForm from '~/components/ResourceForm'
import { RootState } from '~/modules/endUser/core/rootReducers'
import { changePassword, CHANGE_PASSWORD } from '~/core/currentUser'
import { isRequestInProgress } from '~/core/request'
import styles from './ChangePassword.less'

const { I18n } = window

const connecter = connect((state: RootState) => ({
  saveInProgress: isRequestInProgress(state, CHANGE_PASSWORD),
}),
{
  changePassword,
})

type PropsFromRedux = ConnectedProps<typeof connecter>
type Props = PropsFromRedux

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const ChangePasswordComponent: React.FC<Props> = ({ changePassword, saveInProgress }) => {
  const handleChangePassword = values => changePassword(values).then(() => {
    window.location.href = '/users/sign_in'
  })

  return (
    <>
      <title>{`${I18n.t('campaign.dashboard_menu.profile')} ${I18n.t('change_password_page.title')}`}</title>
      <GlintPageHeader />
      <Layout.Content className={styles.pageContent}>
        <Typography.Title level={3}>{I18n.t('change_password_page.title')}</Typography.Title>
        <Row>
          <Col xs={24} lg={12} xl={6}>
            <ResourceForm
              resourceName="passwords"
              readableResourceName="Password"
              scrollToFirstError
              request={{
                submit: handleChangePassword,
              }}
            >
              {() => (
                <>
                  <Form.Item
                    name="currentPassword"
                    label={I18n.t('change_password_page.old_password')}
                  >
                    <Input.Password />
                  </Form.Item>
                  <Form.Item
                    name="password"
                    label={I18n.t('change_password_page.password')}
                  >
                    <Input.Password />
                  </Form.Item>
                  <Form.Item
                    name="passwordConfirmation"
                    label={I18n.t('change_password_page.password_confirmation')}
                  >
                    <Input.Password />
                  </Form.Item>
                  <>
                    <Typography.Text type="warning">
                      <InfoCircleOutlined className={styles.infoIcon} />
                      {I18n.t('change_password_page.warning_message')}
                    </Typography.Text>
                  </>
                  <Space align="baseline" size="middle" className={styles.buttonSpaceContainer}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      className={styles.actionButton}
                    >
                      {I18n.t('profile.update')}
                      <DirectionalArrowIcon className={styles.buttonIcon} />
                    </Button>
                  </Space>
                </>
              )}
            </ResourceForm>
          </Col>
        </Row>
      </Layout.Content>
    </>
  )
}

export const ChangePassword = connecter(ChangePasswordComponent)
