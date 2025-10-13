import React from 'react'
import {
  Form, DatePicker, InputNumber, Select, Spin,
  Switch,
  Button,
  Input
} from 'antd'
import dayjs from '~/utils/dayjs'
import ResourceFormModal from '~/components/ResourceFormModal'
import { useResourceContext } from '~/modules/admin/components/Resource'
import { useResources } from '~/hooks/useResources'
import { ReportFamily, ReportFamilyTR } from '../../../../../../core/reportFamilies'
import { License, LicenseTypes } from '../../../../../../core/licenses'
import { useParams } from 'react-router-dom'

const { I18n } = window

interface Props {
  close(): void,
  license: License
}

interface LicenseFormValues extends Omit<License, 'startDate' | 'endDate'> {
  usageLimit: number
}

export const LicenseFormModal: React.FC<Props> = ({ close, license }) => {
  const { resource } = useResourceContext()
  const { projectId } = useParams() as { projectId: string }

  return (
    <ResourceFormModal
      resourceName="project_licenses"
      readableResourceName="Project License"
      showSuccessMessages
      close={close}
      // resource={licenseResource}
      scrollToFirstError
      modalProps={{ width: 620 }}
      transformValues={(values: LicenseFormValues) => ({
        ...values,
        license_id: license?.id,
      })}
      request={{
        createResource: resource.createResource,
        updateResource: resource.updateResource,
      }}
    >
      {({ form }) => (
        <>
          <Input disabled={true} value={license?.reportFamily?.name} />

          <Form.Item
            name="usage_limit"
            label={I18n.t('licenses.number')}
            rules={[{ required: true }]}
          >
            <InputNumber style={{ width: '25%' }} />
          </Form.Item>

          <Form.Item
            name="enabled"
            label={I18n.t('licenses.enabled')}
            initialValue
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </>
      )}
    </ResourceFormModal>
  )
}
