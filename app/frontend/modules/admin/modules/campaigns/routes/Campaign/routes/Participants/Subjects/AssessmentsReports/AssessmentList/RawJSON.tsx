import {
  Button, Descriptions, message, Row, Tooltip,
} from 'antd'
import {
  FC, useEffect, useState,
} from 'react'
import _ from 'lodash'
import { CopyOutlined, EyeOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { I18nInterface } from '~/modules/survey/core/preview/FlowProcessor/interfaces'
import { useResources } from '~/hooks/useResources'
import { JSONViewCopy } from '~/glint'


type JSONType = 'answers' | 'scoring' | 'externalResults' | 'micrositeRawResponse'
interface Props {
    I18n: I18nInterface
    usersResultId?: number
    micrositeRawResponse?: Record<string, unknown> | null
}

interface AiScoringErrorGroup {
  questions: number[]
  message: string
}

interface Res {
  id: string
  answers?: unknown
  scoring?: unknown
  externalResults?: unknown
  aiScoringErrors?: AiScoringErrorGroup[] | null
  aiScoringStatus?: string | null
  meta?: {
    permissions: {
      show: boolean
    }
  }
}

const RawJSON: FC<Props> = ({ I18n, usersResultId, micrositeRawResponse }) => {
  const [codeModal, setCodeModal] = useState<{
    type: JSONType | null,
    title?: string
  }>({ type: null })

  const {
    data, fetch: fetchUsersResults,
  } = useResources(
    `users_results/${usersResultId}`,
    {
      trackUrl: true,
      apiConfig: {
        fields: {
          users_results: ['id', 'answers', 'scoring',
            'external_results', 'ai_scoring_errors', 'ai_scoring_status'],
        },
        include_resource_meta: ['permissions'],
        camelizeExcept: ['$.scoring.*', '$.answers.*', '$.external_results.*'],
      },
    },
  )

  const usersResults = data as unknown as Res

  useEffect(() => {
    if (usersResultId) {
      fetchUsersResults()
    }
  }, [usersResultId])

  const getCode = (type: JSONType) => {
    if (type === 'micrositeRawResponse') {
      return (micrositeRawResponse && !_.isEmpty(micrositeRawResponse))
        ? micrositeRawResponse
        : I18n.t('user_assessment.drawer.no_data')
    }
    return (usersResults[type] && !_.isEmpty(usersResults[type]))
      ? usersResults[type]
      : I18n.t('user_assessment.drawer.no_data')
  }

  const handleCopy = async (type: JSONType, name = '') => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(getCode(type)))
      message.info(I18n.t('user_assessment.drawer.copied', { name }))
    } catch {
      message.error('Failed to copy')
    }
  }

  const renderCopyControl = (type: JSONType, name = '') => (
    <Tooltip title={I18n.t('user_assessment.drawer.copy')}>
      <Button type="text" icon={<CopyOutlined />} onClick={() => handleCopy(type, name)} />
    </Tooltip>
  )

  const renderCodeModal = () => (codeModal.type ? (
    <JSONViewCopy
      show={!!codeModal.type}
      title={codeModal.title ?? ''}
      json={getCode(codeModal.type)}
      onClose={() => setCodeModal({ type: null })}
      onCopy={() => message.info(I18n.t('user_assessment.drawer.copied', { name: codeModal.title }))}
    />
  ) : null)

  const renderViewCopyControls = (type: JSONType, title: string) => (
    <Row>
      <Tooltip title={I18n.t('user_assessment.drawer.view')}>
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => setCodeModal({ type, title })}
        />
      </Tooltip>
      {renderCopyControl(type, title)}
    </Row>
  )

  if (!usersResults.meta?.permissions.show) return null

  const hasMicrositeRawResponse = micrositeRawResponse && !_.isEmpty(micrositeRawResponse)

  const renderAiScoringErrors = () => {
    const errors = usersResults.aiScoringErrors
    if (!errors?.length) return null

    const hasMultipleDistinctErrors = errors.length > 1

    return (
      <>
        {errors.map(({ questions, message }) => (
          <div key={message}>
            {hasMultipleDistinctErrors && `question_${questions.join(', question_')}: `}
            {message}
          </div>
        ))}
      </>
    )
  }

  return (
    <>
      <Descriptions
        layout="horizontal"
        rootClassName="w-100"
        bordered
        column={1}
      >
        <Descriptions.Item
          label={I18n.t('common.column.json.answer')}
          key="answers"
          className="va-t w-30"
          labelStyle={{ width: '40%' }}
          contentStyle={{ width: '60%' }}
        >
          {renderViewCopyControls('answers', I18n.t('common.column.json.answer'))}
        </Descriptions.Item>
        <Descriptions.Item
          label={I18n.t('common.column.json.scoring')}
          key="scoring"
          className="va-t w-30"
          labelStyle={{ width: '40%' }}
          contentStyle={{ width: '60%' }}
        >
          {renderViewCopyControls('scoring', I18n.t('common.column.json.scoring'))}
        </Descriptions.Item>
        <Descriptions.Item
          label={I18n.t('common.column.json.external_result')}
          key="externalResults"
          className="va-t w-30"
          labelStyle={{ width: '40%' }}
          contentStyle={{ width: '60%' }}
        >
          {renderViewCopyControls('externalResults', I18n.t('common.column.json.external_result'))}
        </Descriptions.Item>
        {usersResults.aiScoringStatus === 'failed' && usersResults.aiScoringErrors && (
          <Descriptions.Item
            label={I18n.t('admin.ai_scoring_errors_label')}
            key="aiScoringErrors"
            className="va-t w-30"
            labelStyle={{ width: '40%' }}
            contentStyle={{ width: '60%' }}
          >
            {renderAiScoringErrors()}
          </Descriptions.Item>
        )}
        {hasMicrositeRawResponse && (
          <Descriptions.Item
            label={I18n.t('common.column.json.microsite_raw_response')}
            key="micrositeRawResponse"
            className="va-t w-30"
            labelStyle={{ width: '40%' }}
            contentStyle={{ width: '60%' }}
          >
            {renderViewCopyControls('micrositeRawResponse', I18n.t('common.column.json.microsite_raw_response'))}
          </Descriptions.Item>
        )}
      </Descriptions>
      {renderCodeModal()}
    </>
  )
}

export default RawJSON
