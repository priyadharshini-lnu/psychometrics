import React from 'react'
import {
  Form, Layout, Typography, Row, Col, Space, Button, Alert,
} from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import { InfoCircleOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { DirectionalArrowIcon, PageHeader as GlintPageHeader, AccessiblePasswordInput } from '~/glint'
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
        <Typography.Title level={1} className={styles.title}>{I18n.t('change_password_page.title')}</Typography.Title>
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
                    <AccessiblePasswordInput autoComplete="tte-old-password" />
                  </Form.Item>
                  <Form.Item
                    name="password"
                    label={I18n.t('change_password_page.password')}
                  >
                    <AccessiblePasswordInput autoComplete="tte-new-password" />
                  </Form.Item>
                  <Form.Item
                    name="passwordConfirmation"
                    label={I18n.t('change_password_page.password_confirmation')}
                  >
                    <AccessiblePasswordInput />
                  </Form.Item>
                  <>
                    <Alert
                      message={(
                        <span>
                          <InfoCircleOutlined className={styles.infoIcon} />
                          {I18n.t('change_password_page.warning_message')}
                        </span>
                      )}
                      type="warning"
                    />
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
