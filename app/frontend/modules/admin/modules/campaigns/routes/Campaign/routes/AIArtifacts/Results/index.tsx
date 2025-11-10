import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { ColumnsType } from 'antd/es/table'
import {
  Table, Pagination, Flex, Input, Skeleton, Popover, message, Typography,
  Tooltip,
} from 'antd'
import { AppstoreOutlined, CheckOutlined, WarningFilled } from '@ant-design/icons'
import * as t from 'io-ts'
import { formatedDate } from '~/utils/time'
import { useResources } from '~/hooks/useResources'
import { TableLayout } from '~/modules/admin/components/TableLayout'
import { useSelectAll } from '~/hooks/useSelectAll'
import { getErrorMsgFromJsonApiRequests } from '~/hooks/useResources/utils'
import { ToolsDropdown } from './ToolsDropdown'
import { ArtifactResultsDrawer } from './ArtifactResultsDrawer'
import styles from '../styles.less'
import { AiArtifact, CampaignAiArtifactResult, CampaignAiArtifactDataSource }
  from '~/modules/admin/modules/campaigns/core/aiArtifacts'

const { I18n } = window

const { Search } = Input

export const Result = () => {
  const { campaignId } = useParams<{ campaignId: string }>()
  const [isCampaignFactorsLoading, setIsCampaignFactorsLoading] = useState(true)
  const [selectedAIArtifact, setSelectedAIArtifact] = useState<CampaignAiArtifactDataSource | null>(null)

  const {
    data: aiArtifact, fetch, changePage,
    meta, currentPage, pageSize, requests,
    isLoading, changeFilter, getFilteredValue,
  } = useResources<CampaignAiArtifactResult>('ai_artifact_results', {
    basePath: `/campaigns/${campaignId}`,
  })

  const {
    collectionAction,
  } = useResources<AiArtifact>('ai_artifacts', {
    basePath: `/campaigns/${campaignId}`,
  })

  useEffect(() => {
    fetch().then(() => {
      setIsCampaignFactorsLoading(false)
    })
  }, [])

  const dataSource = useMemo(() => {
    if (aiArtifact) {
      return aiArtifact
        .reduce((acc:CampaignAiArtifactDataSource[], item:CampaignAiArtifactResult) => {
          acc.push({
            id: item.id,
            key: item.id,
            participantId: item.user.data.id,
            name: item.user.data.attributes.name,
            artifacts: item.artifactsResults.data.reduce((acc, artifactResultData) => {
              const artifactResult = artifactResultData.attributes
              const artifactName = artifactResult.artifact.name

              const artifactData = {
                results: artifactResult.results,
                error: artifactResult.error,
                generatedAt: artifactResult.generatedAt,
                id: artifactResult.artifact.id,
                parsedDependencies: artifactResult.parsedDependencies,
                totalInputTokens: artifactResult.totalInputTokens,
                totalOutputTokens: artifactResult.totalOutputTokens,
              }

              return { ...acc, [artifactName]: artifactData }
            }, {}),
            generatedAt: item.generatedAt,
          })
          return acc
        }, [])
    }
    return []
  }, [aiArtifact])

  const tableColumns:ColumnsType<CampaignAiArtifactDataSource> = useMemo(() => {
    if (dataSource.length === 0) {
      return []
    }
    const artifactsData = dataSource[0].artifacts

    const artifactColumns = Object.keys(artifactsData).map(art => ({
      title: <div>{art}</div>,
      key: art,
      children: artifactsData[art].results.map(result => ({
        title: <div style={{ textAlign: 'left' }}>{result.key}</div>,
        key: result.key,
        render: (_, record) => {
          if (record.artifacts[art].error) {
            return (
              <Popover
                content={(
                  <div style={{ maxWidth: '300px' }}>
                    <Typography.Text style={{ whiteSpace: 'pre-wrap' }}>{record.artifacts[art].error}</Typography.Text>
                  </div>
              )}
              >
                <WarningFilled className={styles.warning} />
              </Popover>
            )
          }
          const currentResult = record.artifacts[art].results.find(r => r.key === result.key)
          if (currentResult && currentResult.value) {
            return (
              <Tooltip
                title={I18n.t('administration.ai_artifacts.generated_at_time',
                  { time: formatedDate(record.artifacts[art].generatedAt) })}
              >
                <CheckOutlined style={{ color: '#52c41a' }} />
              </Tooltip>
            )
          }
          return '-'
        },

      })),
    }
    ))

    return [
      {
        title: <div style={{ textAlign: 'left' }}>{I18n.t('administration.ai_artifacts.id')}</div>,
        dataIndex: 'id',
        key: 'id',
        width: 80,
        fixed: 'left',
        render: (_, record) => (
          <span>{record.participantId}</span>
        ),
      },
      {
        title: I18n.t('administration.ai_artifacts.name'),
        key: 'participantName',
        width: 200,
        fixed: 'left',
        render: (_, record) => (
          <a onClick={() => setSelectedAIArtifact(record)}>
            {record.name}
          </a>
        ),
      },
      ...artifactColumns,
      {
        title: <div style={{ textAlign: 'left' }}>{I18n.t('administration.ai_artifacts.generated_at')}</div>,
        dataIndex: 'generatedAt',
        key: 'generatedAt',
        width: 200,
        fixed: 'right',
        render: generatedAt => (generatedAt ? <span>{formatedDate(generatedAt)}</span> : ''),
      },
    ]
  }, [dataSource])

  const {
    isAllSelected, excludedKeys, selectedKeys, onSelectionChange, onAllSelect,
  } = useSelectAll(false, dataSource)

  const rowSelection = {
    selectedRowKeys: selectedKeys,
    onChange: onSelectionChange,
    preserveSelectedRowKeys: true,
  }

  const handleBulkConfirmAction = (action: string) => {
    if (action === 'generate_results') {
      handleBulkAction('generate_results')
    }
  }

  const handleBulkAction = (action: string) => {
    if (action === 'generate_results') {
      collectionAction({
        action: 'bulk_generate',
        method: 'post',
        body: {
          userIds: isAllSelected ? excludedKeys : selectedKeys,
        },
        responseType: t.type({}),
      }).then(() => {
        message.info(I18n.t('administration.ai_artifacts.generate_result_info_message'))
      })
    }
  }

  return (
    <div>
      <Flex justify="space-between" className="pm">
        <Flex className="pls" justify="center" align="center">
          <AppstoreOutlined style={{ fontSize: '16px' }} />
          <span className="mlm">
            {I18n.t('common.text.total')}
            :
            {' '}
            {meta.recordCount}
          </span>
        </Flex>
        <Flex gap={8}>
          <Search
            placeholder={I18n.t('common.actions.search')}
            value={getFilteredValue('filterable_fields')}
            onChange={({ target: { value } }) => { changeFilter('filterable_fields', value) }}
          />
          <ToolsDropdown
            isBulk
            onClick={action => handleBulkConfirmAction(action)}
            isDisabled={selectedKeys.length === 0}
          />
        </Flex>
      </Flex>
      {isCampaignFactorsLoading ? (
        <Skeleton active />
      ) : (
        <>
          <TableLayout
            table={(
              <Table
                bordered
                rowSelection={rowSelection}
                dataSource={dataSource}
                columns={tableColumns}
                pagination={false}
                scroll={{ x: 'max-content' }}
                loading={isLoading('fetch')}
              />
            )}
            disableHeader
            recordCount={meta.recordCount}
            loading={false}
            requestStatus={requests.fetch?.status}
            selectionSetting={{
              selectionAllowed: aiArtifact.length !== meta.recordCount,
              hasSelectInAllPages: isAllSelected,
              onSelectionChange: onAllSelect,
              label: I18n.t('administration.scoring.select_all', { n: meta.recordCount ?? 0 }),
            }}
            failureMsg={getErrorMsgFromJsonApiRequests(requests)}
            selectedCount={
              (isAllSelected && meta.recordCount) ? (meta.recordCount - excludedKeys.length) : selectedKeys.length
            }
          />
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={meta.recordCount}
            onChange={changePage}
            className="pl"
          />
        </>
      )}
      {selectedAIArtifact ? (
        <ArtifactResultsDrawer
          close={() => { setSelectedAIArtifact(null) }}
          artifact={selectedAIArtifact}
          campaignId={campaignId}
        />
      ) : null}
    </div>
  )
}
