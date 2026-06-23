import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { ColumnsType } from 'antd/es/table'
import {
  Table, Pagination, Flex, Input, Skeleton, Popover, message, Typography,
  Tooltip, App,
} from 'antd'
import * as t from 'io-ts'
import {
  AppstoreOutlined, CheckOutlined, WarningFilled, InfoCircleFilled,
} from '~/glint/icons/AccessibleIconsAntDesign'
import { formatedDate } from '~/utils/time'
import { useResources } from '~/hooks/useResources'
import { TableLayout } from '~/modules/admin/components/TableLayout'
import { useSelectAll } from '~/hooks/useSelectAll'
import { getErrorMsgFromJsonApiRequests } from '~/hooks/useResources/utils'
import { ToolsDropdown } from './ToolsDropdown'
import { ActionsDropdown } from './ActionsDropdown'
import { ArtifactResultsDrawer } from './ArtifactResultsDrawer'
import styles from '../styles.less'
import { AiArtifact, CampaignAiArtifactResult, CampaignAiArtifactDataSource }
  from '~/modules/admin/modules/campaigns/core/aiArtifacts'

const { I18n } = window

const { Search } = Input

export const Result = () => {
  const { campaignId } = useParams<{ campaignId: string }>()
  const { modal } = App.useApp()
  const [isCampaignFactorsLoading, setIsCampaignFactorsLoading] = useState(true)
  const [selectedAIArtifact, setSelectedAIArtifact] = useState<CampaignAiArtifactDataSource | null>(null)

  const {
    data: aiArtifact,
    fetch,
    changePage,
    meta,
    currentPage,
    pageSize,
    requests,
    isLoading,
    changeFilter,
    getFilteredValue,
    setData,
  } = useResources<CampaignAiArtifactResult>('ai_artifact_results', {
    basePath: `/campaigns/${campaignId}`,
  })

  const {
    collectionAction,
  } = useResources<AiArtifact>('ai_artifacts', {
    basePath: `/campaigns/${campaignId}`,
  })

  const {
    collectionAction: resultsCollectionAction,
    memberAction: resultsMemberAction,
  } = useResources<CampaignAiArtifactResult>('ai_artifact_results', {
    basePath: `/campaigns/${campaignId}`,
  })

  useEffect(() => {
    fetch()
      .then(() => {
        setIsCampaignFactorsLoading(false)
      })
  }, [])

  const dataSource = useMemo(() => {
    if (aiArtifact) {
      return aiArtifact
        .reduce((acc: CampaignAiArtifactDataSource[], item: CampaignAiArtifactResult) => {
          acc.push({
            id: item.id,
            key: item.id,
            participantId: item.user.data.id,
            name: item.user.data.attributes.name,
            email: item.user.data.attributes.email,
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
                resultStale: artifactResult.resultStale,
              }

              return {
                ...acc,
                [artifactName]: artifactData,
              }
            }, {}),
            generatedAt: item.generatedAt,
            artifactResultsFinalizedAt: item.artifactResultsFinalizedAt,
          })
          return acc
        }, [])
    }
    return []
  }, [aiArtifact])

  const handleIndividualFinalizeAction = (action: string, record: CampaignAiArtifactDataSource) => {
    const finalized = action === 'mark_finalized'
    resultsMemberAction({
      id: record.participantId,
      action: 'change_finalized_artifact_results',
      method: 'post',
      body: { finalized },
    }).then(() => {
      setData(aiArtifact.map((item) => {
        if (item.user.data.id === record.participantId) {
          return {
            ...item,
            artifactResultsFinalizedAt: finalized ? new Date().toISOString() : null,
          }
        }
        return item
      }))
      message.success(I18n.t('frontend.resource.update_success', { readableResourceName: record.email }))
    })
  }

  const handleIndividualConfirmAction = (action: string, record: CampaignAiArtifactDataSource) => {
    if (action === 'generate_results') {
      collectionAction({
        action: 'bulk_generate',
        method: 'post',
        body: { userIds: [record.participantId] },
        responseType: t.type({}),
      }).then(() => {
        message.info(I18n.t('admin.generate_result_info_message'))
      })
      return
    }
    const isFinalize = action === 'mark_finalized'
    const titleKey = isFinalize ? 'admin.mark_finalized' : 'admin.mark_not_finalized'
    const contentKey = isFinalize
      ? 'admin.mark_finalized_confirm'
      : 'admin.mark_not_finalized_confirm'
    modal.confirm({
      title: I18n.t(titleKey),
      content: I18n.t(contentKey, { email: record.email }),
      onOk: () => handleIndividualFinalizeAction(action, record),
    })
  }

  const tableColumns: ColumnsType<CampaignAiArtifactDataSource> = useMemo(() => {
    if (dataSource.length === 0) {
      return []
    }
    const artifactsData = dataSource[0].artifacts

    const artifactColumns = Object.keys(artifactsData)
      .map(art => ({
        className: styles.artifactResultsColumns,
        title: <div>{art}</div>,
        key: art,
        children: artifactsData[art].results.map(result => ({
          className: styles.artifactResultsColumns,
          title: <div style={{ textAlign: 'left' }}>{result.key}</div>,
          key: result.key,
          render: (_, record) => {
            if (record.artifacts[art].error) {
              return (
                <Popover
                  content={(
                    <div style={{ maxWidth: '300px' }}>
                      <Typography.Text
                        style={{ whiteSpace: 'pre-wrap' }}
                      >
                        {record.artifacts[art].error}
                      </Typography.Text>
                    </div>
                    )}
                >
                  <span>
                    <WarningFilled className={styles.error} />
                  </span>
                </Popover>
              )
            }
            const currentResult = record.artifacts[art].results.find(r => r.key === result.key)
            if (currentResult && currentResult.value) {
              return (
                <>
                  {record.artifacts[art].resultStale ? (
                    <Tooltip title={I18n.t('admin.ai_artifact_result_stale')}>
                      <span>
                        <InfoCircleFilled className={styles.warning} />
                      </span>
                    </Tooltip>
                  )
                    : (
                      <Tooltip
                        title={I18n.t('admin.generated_at_time',
                          { time: formatedDate(record.artifacts[art].generatedAt) })}
                      >
                        <span>
                          <CheckOutlined style={{ color: '#52c41a' }} />
                        </span>
                      </Tooltip>
                    )
                }
                </>
              )
            }
            return '-'
          },

        })),
      }
      ))

    return [
      {
        title: <div style={{ textAlign: 'left' }}>{I18n.t('shared.id')}</div>,
        dataIndex: 'id',
        key: 'id',
        width: 80,
        fixed: 'left',
        render: (_, record) => (
          <span>{record.participantId}</span>
        ),
      },
      {
        title: I18n.t('shared.name'),
        key: 'participantName',
        width: 200,
        fixed: 'left',
        render: (_, record) => (
          <a onClick={() => setSelectedAIArtifact(record)}>
            <Flex vertical>
              <Typography.Link>{record.name}</Typography.Link>
              <Typography.Text style={{ fontSize: 12 }}>{record.email}</Typography.Text>
            </Flex>
          </a>
        ),
      },
      ...artifactColumns,
      {
        title: <div style={{ textAlign: 'left' }}>{I18n.t('admin.finalized_at')}</div>,
        dataIndex: 'artifactResultsFinalizedAt',
        key: 'artifactResultsFinalizedAt',
        width: 200,
        render: finalizedAt => (finalizedAt ? <span>{formatedDate(finalizedAt)}</span> : '-'),
      },
      {
        title: <div style={{ textAlign: 'left' }}>{I18n.t('shared.actions')}</div>,
        key: 'actions',
        width: 80,
        fixed: 'right',
        render: (_, record) => (
          <ActionsDropdown
            onClick={action => handleIndividualConfirmAction(action, record)}
          />
        ),
      },
    ]
  }, [dataSource])

  const {
    isAllSelected,
    excludedKeys,
    selectedKeys,
    onSelectionChange,
    onAllSelect,
  } = useSelectAll(false, dataSource)

  const rowSelection = {
    selectedRowKeys: selectedKeys,
    onChange: onSelectionChange,
    preserveSelectedRowKeys: true,
  }

  const handleBulkConfirmAction = (action: string) => {
    if (action === 'generate_results') {
      handleBulkAction('generate_results')
    } else if (action === 'mark_finalized' || action === 'mark_not_finalized') {
      const isFinalize = action === 'mark_finalized'
      const titleKey = isFinalize ? 'admin.mark_finalized' : 'admin.mark_not_finalized'
      const contentKey = isFinalize
        ? 'admin.mark_finalized_bulk_confirm'
        : 'admin.mark_not_finalized_bulk_confirm'
      modal.confirm({
        title: I18n.t(titleKey),
        content: I18n.t(contentKey),
        onOk: () => handleBulkFinalizeAction(action),
      })
    }
  }

  const handleBulkFinalizeAction = (action: string) => {
    const finalized = action === 'mark_finalized'
    resultsCollectionAction({
      action: 'change_finalized_artifact_results_bulk',
      method: 'post',
      body: {
        userIds: isAllSelected ? excludedKeys : selectedKeys,
        finalized,
      },
      responseType: t.literal('ok'),
    }).then(() => {
      const nameKey = finalized ? 'admin.mark_finalized' : 'admin.mark_not_finalized'
      message.success(I18n.t('frontend.resource.update_success',
        { readableResourceName: I18n.t(nameKey) }))
    })
  }

  const handleToolConfirmAction = (action: string) => {
    if (action === 'export_results') {
      handleExportArtifactsResults()
    }
  }

  const handleExportArtifactsResults = () => {
    resultsCollectionAction({
      action: 'export',
      method: 'post',
    }).then(() => {
      message.info(I18n.t('admin.results_export_job_scheduled'))
    })
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
      })
        .then(() => {
          message.info(I18n.t('admin.generate_result_info_message'))
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
            placeholder={I18n.t('shared.search')}
            value={getFilteredValue('filterable_fields')}
            onChange={({ target: { value } }) => {
              changeFilter('filterable_fields', value)
            }}
          />
          <ToolsDropdown
            isBulk
            onClick={action => handleToolConfirmAction(action)}
          />
          <ActionsDropdown
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
              label: I18n.t('admin.scoring_select_all', { n: meta.recordCount ?? 0 }),
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
          close={() => {
            setSelectedAIArtifact(null)
          }}
          userArtifactsResults={selectedAIArtifact}
          campaignId={campaignId}
          rawTableData={aiArtifact}
          updateRawTableData={setData}
        />
      ) : null}
    </div>
  )
}
