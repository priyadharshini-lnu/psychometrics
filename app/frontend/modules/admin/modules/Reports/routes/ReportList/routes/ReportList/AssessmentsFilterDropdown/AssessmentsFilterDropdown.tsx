import React, { useEffect, useState } from 'react'
import {
  Button, Checkbox, Col, Input, Menu, Row, Spin,
} from 'antd'
import { FilterDropdownProps } from 'antd/es/table/interface'
import { SearchOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { MenuItem } from '~/interfaces/Antd'
import { Assessment } from '~/modules/admin/modules/client/core/assessments'
import { useResources } from '~/hooks/useResources'
import styles from './AssessmentsFilterDropdown.less'

const { I18n } = window

export const AssessmentsFilterDropdown: React.FC<FilterDropdownProps> = (props) => {
  const {
    setSelectedKeys, selectedKeys, confirm, clearFilters, close,
  } = props
  const {
    data: assessments, fetch: fetchAssessments, isLoading: isAssessmentLoading,
  } = useResources<Assessment>('assessments', { apiConfig: { fields: { assessments: ['name'] } } })

  useEffect(() => {
    fetchAssessments()
  }, [])

  useEffect(() => {
    setItems(assessments.map(a => ({
      key: a.id,
      label: (
        <>
          <Checkbox checked={selectedKeys.includes(a.id)} />
          <span>{a.name}</span>
        </>
      ),
    })))
  }, [assessments, selectedKeys])

  const [openKeys, setOpenKeys] = React.useState<string[]>([])
  const onOpenChange = (keys: string[]) => {
    setOpenKeys(keys)
  }

  const [items, setItems] = useState<MenuItem[]>([{
    key: 'key',
    label: (
      <>
        <Checkbox checked={selectedKeys.includes(11)} />
        <span>text</span>
      </>
    ),
  }])

  const getResetDisabled = () => selectedKeys.length === 0

  const handleSearch = (value: string) => {
    fetchAssessments({ apiConfig: { filter: { filterable_fields: value } } })
  }

  const onSelectKeys = ({ selectedKeys }: { selectedKeys: string[] }) => {
    setSelectedKeys(selectedKeys)
  }

  const handleConfirm = () => {
    confirm()
    close()
  }

  return (
    <div className={styles.container}>
      <div className={styles.search}>
        <Input
          prefix={<SearchOutlined />}
          className={styles.input}
          placeholder="Search"
          onChange={e => handleSearch(e.target.value)}
        />
      </div>
      {isAssessmentLoading('fetch')
        ? <Row justify="center"><Col span="2"><Spin className="m8" /></Col></Row>
        : (
          <Menu
            selectable
            multiple
            onSelect={onSelectKeys}
            onDeselect={onSelectKeys}
            selectedKeys={selectedKeys as string[]}
            openKeys={openKeys}
            onOpenChange={onOpenChange}
            items={items}
          />
        )}
      <div className={styles.buttons}>
        <Button type="link" size="small" disabled={getResetDisabled()} onClick={() => clearFilters && clearFilters()}>
          {I18n.t('common.actions.reset')}
        </Button>
        <Button type="primary" size="small" onClick={handleConfirm}>
          {I18n.t('common.actions.ok')}
        </Button>
      </div>
    </div>
  )
}
