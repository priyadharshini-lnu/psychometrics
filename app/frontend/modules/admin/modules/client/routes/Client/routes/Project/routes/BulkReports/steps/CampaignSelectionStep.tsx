import {
  FC, useEffect, useState,
} from 'react'
import type { ColumnsType } from 'antd/es/table'
import {
  Input, Typography, Flex, Select, Checkbox, Badge, Button, Space, Table,
} from 'antd'
import { useResources } from '~/hooks/useResources'
import { SearchOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { formatSelectedTagCount } from '../core'
import { LocalCampaign, CampaignsMeta } from '../types'
import styles from './SelectionTableRows.less'

export type { LocalCampaign }

const { Text } = Typography
const { I18n } = window

const PAGE_SIZE = 25

type Props = {
  projectId: number
  selectedCampaignIds: Set<string>
  onSelectionChange: (ids: Set<string>, campaigns: LocalCampaign[]) => void
}

const CampaignSelectionStep: FC<Props> = ({
  projectId,
  selectedCampaignIds,
  onSelectionChange,
}) => {
  const [searchText, setSearchText] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [tagSelectOpen, setTagSelectOpen] = useState(false)

  const {
    data: campaigns,
    fetch: fetchCampaigns,
    isLoading: isCampaignsLoading,
    meta,
    currentPage,
    pageSize,
    changePage,
    changeFilter,
    removeFilter,
  } = useResources<LocalCampaign, CampaignsMeta>('campaigns', {
    basePath: `projects/${projectId}`,
    apiConfig: {
      page: { size: PAGE_SIZE, number: 1 },
    },
  })

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setSearchText(value)
    changeFilter('name_cont', value)
  }

  const handleTagsChange = (tags: string[]) => {
    setSelectedTags(tags)
    if (tags.length > 0) {
      changeFilter('tagged_with', tags)
    } else {
      removeFilter('tagged_with')
    }
  }

  const handleTagsClear = () => {
    setSelectedTags([])
    removeFilter('tagged_with')
  }

  const visibleCampaigns = campaigns ?? []
  const totalCampaigns = meta?.recordCount ?? 0

  const toggleCampaign = (campaignId: string) => {
    const next = new Set(selectedCampaignIds)
    if (next.has(campaignId)) {
      next.delete(campaignId)
    } else {
      next.add(campaignId)
    }
    onSelectionChange(next, visibleCampaigns)
  }

  const allShownSelected = visibleCampaigns.length > 0
    && visibleCampaigns.every(c => selectedCampaignIds.has(String(c.id)))

  const handleSelectAllShown = () => {
    const next = new Set(selectedCampaignIds)
    if (allShownSelected) {
      visibleCampaigns.forEach(c => next.delete(String(c.id)))
    } else {
      visibleCampaigns.forEach(c => next.add(String(c.id)))
    }
    onSelectionChange(next, visibleCampaigns)
  }

  const campaignTags = meta?.availableTags ?? []
  const campaignTagCounts = Object.fromEntries(
    campaignTags.map(({ name, campaignsCount }) => [name, campaignsCount]),
  )
  const isLoading = isCampaignsLoading('fetch')
  const shownCount = visibleCampaigns.length

  const columns: ColumnsType<LocalCampaign> = [
    {
      key: 'campaign',
      render: (_, campaign) => (
        <div style={{ minWidth: 0 }}>
          <Text strong style={{ display: 'block', fontSize: 14, lineHeight: '1.4' }}>
            {campaign.name}
          </Text>
          <Flex gap={6} align="center" style={{ marginTop: 3 }} wrap="wrap">
            {campaign.project?.name && (
              <Text style={{ fontSize: 12.5, fontWeight: 600 }}>
                {campaign.project.name}
              </Text>
            )}
            {campaign.tagList?.map(tag => (
              <Text key={tag} type="secondary" style={{ fontSize: 12.5 }}>
                {tag}
              </Text>
            ))}
          </Flex>
        </div>
      ),
    },
    {
      key: 'candidateCount',
      width: 90,
      align: 'right',
      render: (_, campaign) => {
        const candidateCount = campaign.candidatesCount ?? null
        if (candidateCount === null) return null

        return (
          <Text type="secondary" style={{ fontSize: 12.5, whiteSpace: 'nowrap' }}>
            {Number(candidateCount).toLocaleString()}
            {' '}
            {I18n.t('admin.bulk_reports_candidate_abbreviation')}
          </Text>
        )
      },
    },
    {
      key: 'status',
      width: 110,
      render: (_, campaign) => (
        <Badge
          status={campaign.status === 'active' ? 'success' : 'default'}
          text={campaign.status}
        />
      ),
    },
  ]

  const campaignsTable = (
    <Table<LocalCampaign>
      className={styles.selectionTable}
      rowKey={campaign => String(campaign.id)}
      dataSource={visibleCampaigns}
      columns={columns}
      loading={isLoading}
      showHeader={false}
      rowClassName={campaign => (selectedCampaignIds.has(String(campaign.id)) ? styles.selectedRow : '')}
      locale={{
        emptyText: searchText || selectedTags.length > 0
          ? I18n.t('admin.bulk_reports_no_campaigns_match_filters')
          : I18n.t('admin.bulk_reports_no_campaigns_found'),
      }}
      rowSelection={{
        type: 'checkbox',
        selectedRowKeys: [...selectedCampaignIds],
        preserveSelectedRowKeys: true,
        onChange: ids => onSelectionChange(new Set(ids.map(String)), visibleCampaigns),
      }}
      onRow={campaign => ({
        onClick: () => toggleCampaign(String(campaign.id)),
        onKeyDown: e => e.key === 'Enter' && toggleCampaign(String(campaign.id)),
        tabIndex: 0,
        style: { cursor: 'pointer' },
      })}
      pagination={{
        current: currentPage,
        pageSize,
        total: totalCampaigns,
        onChange: changePage,
        showSizeChanger: true,
        hideOnSinglePage: true,
      }}
    />
  )

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, overflow: 'hidden',
    }}
    >
      <div style={{ flexShrink: 0 }}>
        <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 4 }}>
          {I18n.t('admin.bulk_reports_select_campaigns')}
        </Text>
        <Text type="secondary" style={{ display: 'block', marginBottom: 16, fontSize: 13.5 }}>
          {I18n.t('admin.bulk_reports_select_campaigns_description')}
        </Text>
        <Input
          prefix={<SearchOutlined />}
          placeholder={I18n.t('admin.bulk_reports_campaign_search_placeholder')}
          value={searchText}
          onChange={handleSearchChange}
          style={{ marginBottom: 16 }}
          allowClear
          onClear={() => {
            setSearchText('')
            changeFilter('name_cont', '')
          }}
        />
        <Flex align="center" gap={10} style={{ marginBottom: 14 }}>
          <Text
            type="secondary"
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              flexShrink: 0,
            }}
          >
            {I18n.t('common.actions.filter_by_tags')}
          </Text>
          <Select
            mode="multiple"
            value={selectedTags}
            open={tagSelectOpen}
            onOpenChange={setTagSelectOpen}
            onChange={handleTagsChange}
            style={{ minWidth: 300 }}
            placeholder={I18n.t('admin.bulk_reports_all_tags')}
            maxTagCount={0}
            menuItemSelectedIcon={null}
            maxTagPlaceholder={() => (selectedTags.length === 0
              ? I18n.t('admin.bulk_reports_all_tags')
              : formatSelectedTagCount(selectedTags.length))}
            showSearch
            filterOption={(input, option) => String(option?.value ?? '').toLowerCase().includes(input.toLowerCase())}
            notFoundContent={I18n.t('admin.bulk_reports_no_tags_found')}
            optionRender={(option) => {
              const tagName = String(option.value)
              const count = campaignTagCounts[tagName] ?? 0
              return (
                <Flex align="center" justify="space-between" style={{ width: '100%' }}>
                  <Space size={8}>
                    <Checkbox checked={selectedTags.includes(tagName)} />
                    <span>{tagName}</span>
                  </Space>
                  <Badge
                    count={count}
                    style={{
                      backgroundColor: 'var(--ant-color-fill-secondary)',
                      color: 'var(--ant-color-text-secondary)',
                      boxShadow: 'none',
                      fontWeight: 500,
                    }}
                  />
                </Flex>
              )
            }}
            popupRender={menu => (
              <>
                {menu}
                <Flex
                  justify="space-between"
                  align="center"
                  style={{
                    padding: '8px 12px',
                    borderTop: '1px solid var(--ant-color-split)',
                  }}
                >
                  <Button type="link" size="small" onClick={handleTagsClear} style={{ padding: 0 }}>
                    {I18n.t('shared.clear')}
                  </Button>
                  <Button
                    size="small"
                    onClick={() => setTagSelectOpen(false)}
                  >
                    {I18n.t('common.actions.done')}
                  </Button>
                </Flex>
              </>
            )}
          >
            {campaignTags.map(({ id, name }) => (
              <Select.Option key={id} value={name}>
                {name}
              </Select.Option>
            ))}
          </Select>
        </Flex>

        <Flex justify="space-between" align="center" style={{ marginBottom: 10 }}>
          <Button
            type="link"
            onClick={handleSelectAllShown}
            style={{
              padding: 0, fontSize: 13, fontWeight: 600, height: 'auto',
            }}
          >
            {allShownSelected
              ? I18n.t('admin.bulk_reports_deselect_all_shown')
              : I18n.t('admin.bulk_reports_select_all_shown')}
          </Button>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {I18n.t('admin.bulk_reports_campaigns_shown_count', {
              selected: selectedCampaignIds.size,
              shown: shownCount,
            })}
          </Text>
        </Flex>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        {campaignsTable}
      </div>
    </div>
  )
}

export default CampaignSelectionStep
