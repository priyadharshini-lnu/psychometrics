import React, { useEffect, useState } from 'react'
import * as t from 'io-ts'
import {
  Form, Checkbox, Divider, Button, Space, App,
} from 'antd'
import map from 'lodash/map'
import { useResources } from '~/hooks/useResources'
import { PageLoadSpinner } from '~/glint'
import { BaseMeta } from '~/hooks/useResources/interfaces'
import { AdminTypes } from '~/modules/admin/modules/Admins/constants'
import { AvailablePermissions } from '~/modules/admin/modules/Admins/core'

const AvailablePermissionsTR = t.record(t.string, t.union([t.array(t.string), t.undefined]))

const MembershipTR = t.type({
  id: t.string,
  grantNames: t.union([
    t.partial({
      clients: t.array(t.string),
      projects: t.array(t.string),
      project_settings: t.array(t.string),
      campaigns: t.array(t.string),
      dashboards: t.array(t.string),
      messages: t.array(t.string),
      sms_invites: t.array(t.string),
      results: t.array(t.string),
      registration_codes: t.array(t.string),
      communications: t.array(t.string),
      assessors: t.array(t.string),
      reports: t.array(t.string),
      datasheets: t.array(t.string),
    }),
    t.null,
  ]),
})

type Membership = t.TypeOf<typeof MembershipTR>

const { I18n } = window

type Props = {
  applicationId: string
  role: AdminTypes
  scopeFilter: Record<string, string>
}

export const ApplicationPermissions: React.FC<Props> = ({ applicationId, role, scopeFilter }) => {
  const [form] = Form.useForm()
  const [availablePermissions, setAvailablePermissions] = useState<AvailablePermissions>({})
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(true)
  const { message } = App.useApp()

  const {
    data: memberships,
    fetch: fetchMemberships,
    updateResource,
    collectionAction,
    isLoading,
  } = useResources<Membership, BaseMeta>('memberships', {
    responseType: MembershipTR,
    apiConfig: {
      filter: {
        user_id_eq: applicationId,
        with_role: role,
        ...scopeFilter,
      },
      include: ['admin_roles'],
    },
  })

  const membership = memberships[0]

  useEffect(() => {
    fetchMemberships()
    collectionAction({
      action: 'available_permissions',
      method: 'get',
      body: { role },
      responseType: AvailablePermissionsTR,
    }).then((response) => {
      setAvailablePermissions(response as AvailablePermissions)
    }).finally(() => {
      setIsLoadingPermissions(false)
    })
  }, [applicationId])

  useEffect(() => {
    if (membership) {
      form.setFieldsValue({ grantNames: membership.grantNames ?? {} })
    }
  }, [membership])

  const handleSave = async (values: { grantNames: Record<string, string[]> }) => {
    await updateResource({ id: membership.id, grantNames: values.grantNames })
    message.success(I18n.t('admin.permissions_updated'))
  }

  if (isLoading('fetch') || isLoadingPermissions) {
    return <PageLoadSpinner />
  }

  if (!membership) {
    return null
  }

  return (
    <div style={{ padding: 20 }}>
      <Form form={form} layout="vertical" onFinish={handleSave}>
        {map(availablePermissions, (grants, grantFor) => (
          <React.Fragment key={grantFor}>
            <Form.Item
              name={['grantNames', grantFor]}
              label={I18n.t(`admin.permissions.${grantFor}.title`)}
              initialValue={map(membership.grantNames?.[grantFor], grantName => grantName)}
            >
              <Checkbox.Group>
                {map(grants, grant => (
                  <Checkbox key={grant} value={grant}>
                    {I18n.t(`admin.permissions.${grantFor}.${grant}`)}
                  </Checkbox>
                ))}
              </Checkbox.Group>
            </Form.Item>
            <Divider />
          </React.Fragment>
        ))}
        <Space>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading(`update@${membership.id}`)}
          >
            {I18n.t('shared.save')}
          </Button>
        </Space>
      </Form>
    </div>
  )
}
