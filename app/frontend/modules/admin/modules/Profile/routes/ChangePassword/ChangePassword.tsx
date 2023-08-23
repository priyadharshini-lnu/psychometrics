import React from 'react'
import {
  Form, Layout, Typography, Input, Row, Col, Space, Button, Image,
} from 'antd'
import { useResources } from '~/hooks/useResources'
import { UserDetails } from '~/modules/admin/modules/client/core/users'
import ResourceForm from '~/components/ResourceForm'
import { DirectionalArrowIcon } from '~/glint'
import styles from './ChangePassword.less'
import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'
import { SuccessMessageTR } from '~/modules/admin/modules/client/core/successMessage'
import illustration from '../../assets/images/ChangePassword.png'

const { I18n } = window

export const ChangePassword: React.FC = () => {
  const { collectionAction } = useResources<UserDetails>('users')

  const updateResource = (body: Record<string, string | undefined | null>) => collectionAction({
    action: 'change_password',
    method: 'post',
    body,
    updateStore: true,
    responseType: SuccessMessageTR,
  })

  const handleChangePassword = values => updateResource(values).then(() => {
    location.href = '/'
  })

  return (
    <>
      <Breadcrumb
        crumbs={[
          {
            link: () => '/admin/profile',
            label: () => I18n.t('administration.profile.profile'),
          },
          {
            label: () => I18n.t('administration.profile.change_password'),
          },
        ]}
      />
      <Layout.Content className={styles.pageContent}>
        <Typography.Title level={3}>{I18n.t('change_password_page.title')}</Typography.Title>
        <Row gutter={32} align="middle">
          <Col xs={24} lg={12} xl={6}>
            <Image src={illustration} preview={false} />
          </Col>
          <Col xs={24} lg={12} xl={6}>
            <ResourceForm
              resourceName="users"
              readableResourceName="User"
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
