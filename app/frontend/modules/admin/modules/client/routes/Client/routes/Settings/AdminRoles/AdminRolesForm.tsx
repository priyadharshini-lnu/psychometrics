import React, { Fragment, useEffect, useState } from 'react'
import {
  Checkbox, Divider, Form, Input,
} from 'antd'
import _ from 'lodash'
import ResourceFormModal from '~/components/ResourceFormModal'
import { useResourceContext } from '~/modules/admin/components/Resource'
import { AdminRole } from '~/modules/admin/modules/client/core/adminRole'
import { useResources } from '~/hooks/useResources'
import { Admin } from '~/modules/admin/modules/client/core/admin'
import { AvailablePermissions } from '~/modules/admin/modules/Admins/core'

interface Props {
  role?: AdminRole
  close(): void
}

const { I18n } = window

export const AdminRolesForm: React.FC<Props> = ({
  role, close,
}) => {
  const { resource } = useResourceContext<AdminRole>()
  const [availablePermissions, setAvailablePermissions] = useState<AvailablePermissions>({})
  const { collectionAction: membershipCollectionAction } = useResources<Admin>('memberships')

  useEffect(() => {
    membershipCollectionAction(
      { action: 'available_permissions', method: 'get', body: { role: 'client_admin' } },
    ).then((response: AvailablePermissions) => {
      setAvailablePermissions(response)
    })
  }, [])

  const [form] = Form.useForm()

  return (
    <ResourceFormModal
      resourceName="roles"
      resource={role}
      readableResourceName={I18n.t('admin.admin_roles')}
      showSuccessMessages
      close={close}
      storeManager={{ form }}
      scrollToFirstError
      modalProps={{ width: 900 }}
      request={{
        createResource: resource.createResource,
        updateResource: resource.updateResource,
      }}
    >
      {() => (
        <>
          <Form.Item
            name="name"
            label={I18n.t('shared.name')}
            rules={[{ required: true }]}
          >
            <Input name="admin_role_name" />
          </Form.Item>
          <Form.Item
            name="description"
            label={I18n.t('shared.description')}
            rules={[{ required: true }]}
          >
            <Input.TextArea />
          </Form.Item>

          {_.map(availablePermissions, (grants, grantFor) => (
            <Fragment key={grantFor}>
              <Form.Item
                name={['permissions', `${grantFor}`]}
                label={I18n.t(`admin.permissions.${grantFor}.title`)}
                className="mb-5"
              >
                <Checkbox.Group>
                  {_.map(grants, grant => (
                    <Checkbox value={grant} key={grant as string}>
                      {I18n.t(`admin.permissions.${grantFor}.${grant}`)}
                    </Checkbox>
                  ))}
                </Checkbox.Group>
              </Form.Item>
              <Divider className="p-0 m-0 mb-5" />
            </Fragment>
          ))}
        </>
      )}
    </ResourceFormModal>
  )
}
