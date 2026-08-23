import React, { useEffect } from 'react'
import {
  Form, Select, Switch,
} from 'antd'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  datasheetIdentity,
  fetchDatasheetColumns,
  get as getColumns,
} from '~/modules/admin/modules/SheetManagement/core/columnDefinitions'
import { RootState } from '~/modules/admin/core/rootReducers'

const { I18n } = window

export const DatasheetForm: React.FC = () => {
  const { campaignId } = useParams() as { campaignId: string }
  const dispatch = useDispatch()
  const parsedCampaignId = parseInt(campaignId, 10)
  const columns = useSelector((state: RootState) => getColumns(state, datasheetIdentity(parsedCampaignId)))
  const includeAllColumns = Form.useWatch('includeAllDatasheetColumns')

  useEffect(() => {
    dispatch(fetchDatasheetColumns(parsedCampaignId))
  }, [campaignId])

  return (
    <>
      <Form.Item
        name="includeAllDatasheetColumns"
        label={I18n.t('admin.form_include_all_datasheet_columns')}
      >
        <Switch />
      </Form.Item>
      {!includeAllColumns ? (
        <Form.Item
          name="datasheetColumns"
          label={I18n.t('admin.form_datasheet_columns')}
        >
          <Select
            mode="multiple"
            placeholder={I18n.t('admin.form_select_datasheet_columns')}
            allowClear
            showSearch
            filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
            options={columns.map(column => ({ value: column.id, label: column.name }))}
          />
        </Form.Item>
      ) : null}
    </>
  )
}
