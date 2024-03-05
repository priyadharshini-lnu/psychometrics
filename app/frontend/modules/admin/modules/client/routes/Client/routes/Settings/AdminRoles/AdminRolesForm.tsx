import React, { Fragment } from 'react'
import {
  Checkbox, Divider, Form, Input,
} from 'antd'
import _ from 'lodash'
import ResourceFormModal from '~/components/ResourceFormModal'
import { useResourceContext } from '~/modules/admin/components/Resource'
import { AdminRole } from '~/modules/admin/modules/client/core/adminRole'
import { ClientAdminGrants } from '~/modules/admin/modules/Admins/constants'

interface Props {
  role?: AdminRole
  close(): void
}

const { I18n } = window

export const AdminRolesForm: React.FC<Props> = ({
  role, close,
}) => {
  const { resource } = useResourceContext<AdminRole>()
  const grantsHash = (): {} => ClientAdminGrants
  const [form] = Form.useForm()

  return (
    <ResourceFormModal
      resourceName="roles"
      resource={role}
      readableResourceName={I18n.t('administration.settings.admin_roles.admin_role_single')}
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
            label={I18n.t('administration.settings.admin_roles.name')}
            rules={[{ required: true }]}
          >
            <Input name="admin_role_name" />
          </Form.Item>
          <Form.Item
            name="description"
            label={I18n.t('administration.settings.admin_roles.description')}
            rules={[{ required: true }]}
          >
            <Input.TextArea />
          </Form.Item>

          {_.map(grantsHash(), (grants, grantFor) => (
            <Fragment key={grantFor}>
              <Form.Item
                name={['permissions', `${grantFor}`]}
                label={_.startCase(grantFor)}
                className="mb-5"
              >
                <Checkbox.Group>
                  {_.map(grants, grant => (
                    <Checkbox value={grant} key={grant as string}>
                      {I18n.t(`administration.administrators.permissions.labels.${grantFor}.${grant}`)}
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
