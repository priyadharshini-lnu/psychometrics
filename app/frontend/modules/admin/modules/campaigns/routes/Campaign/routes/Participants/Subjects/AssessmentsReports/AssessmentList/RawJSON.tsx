import {
  Button, Descriptions, message, Row, Tooltip,
} from 'antd'
import {
  FC, useEffect, useState,
} from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import _ from 'lodash'
import { CopyOutlined, EyeOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { I18nInterface } from '~/modules/survey/core/preview/FlowProcessor/interfaces'
import { useResources } from '~/hooks/useResources'
import { JSONViewCopy } from '~/glint'


type JSONType = 'answers' | 'scoring' | 'externalResults'
interface Props {
    I18n: I18nInterface
    usersResultId?: number
}

interface Res {
  id: string
  answers?: unknown
  scoring?: unknown
  externalResults?: unknown
  meta?: {
    permissions: {
      show: boolean
    }
  }
}

const RawJSON: FC<Props> = ({ I18n, usersResultId }) => {
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
        fields: { users_results: ['id', 'answers', 'scoring', 'external_results'] },
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

  const getCode = (type: JSONType) => ((usersResults[type] && !_.isEmpty(usersResults[type]))
    ? usersResults[type]
    : I18n.t('user_assessment.drawer.no_data'))

  const renderCopyControl = (type: JSONType, name = '') => (
    <CopyToClipboard
      text={JSON.stringify(getCode(type))}
      onCopy={() => message.info(I18n.t('user_assessment.drawer.copied', { name }))}
    >
      <Tooltip title={I18n.t('user_assessment.drawer.copy')}>
        <Button type="text" icon={<CopyOutlined />} />
      </Tooltip>
    </CopyToClipboard>
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
          key="modified_by"
          className="va-t w-30"
          labelStyle={{ width: '40%' }}
          contentStyle={{ width: '60%' }}
        >
          {renderViewCopyControls('answers', I18n.t('common.column.json.answer'))}
        </Descriptions.Item>
        <Descriptions.Item
          label={I18n.t('common.column.json.scoring')}
          key="modified_by"
          className="va-t w-30"
          labelStyle={{ width: '40%' }}
          contentStyle={{ width: '60%' }}
        >
          {renderViewCopyControls('scoring', I18n.t('common.column.json.scoring'))}
        </Descriptions.Item>
        <Descriptions.Item
          label={I18n.t('common.column.json.external_result')}
          key="modified_by"
          className="va-t w-30"
          labelStyle={{ width: '40%' }}
          contentStyle={{ width: '60%' }}
        >
          {renderViewCopyControls('externalResults', I18n.t('common.column.json.external_result'))}
        </Descriptions.Item>
      </Descriptions>
      {renderCodeModal()}
    </>
  )
}

export default RawJSON
