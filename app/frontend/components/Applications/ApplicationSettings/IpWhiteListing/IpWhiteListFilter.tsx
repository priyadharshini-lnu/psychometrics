import React from 'react'
import { Button, Space } from 'antd'
import { PlusOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { Resource } from '~/modules/admin/components/Resource'

const { I18n } = window

type Props = {
  openModal: () => void
}

export const IpWhiteListFilter: React.FC<Props> = ({ openModal }) => (
  <Resource.Filter hideSearch name="filterable_fields">
    <Space>
      <Button type="primary" onClick={openModal} icon={<PlusOutlined />}>
        {I18n.t('shared.add')}
      </Button>
    </Space>
  </Resource.Filter>
)
