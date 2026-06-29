/* eslint-disable prefer-destructuring */
import React, { useState, useEffect } from 'react'
import {
  Flex, Button, Typography, Modal, Card, Tooltip,
} from 'antd'
import cs from 'classnames'
import { EyeOutlined, ReloadOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { SafeHTML } from '~/components/SafeHTML'
import { useResources } from '~/hooks/useResources/useResources'
import '~/libs/htmldiff.cjs'
import {
  AiAssistantTR, AIAssistantRevisionsTR, AIAssistantRevision,
} from '~/modules/admin/modules/AiAssitant/core/aiAssistant'
import styles from './styles.less'

type ComputedDiffs = { name?: string; systemPrompt?: string; userPrompt?: string }

type Props = {
  aiAssistantId: string
  onSelect: (data: { name?: string; systemPrompt?: string; userPrompt?: string }) => void
}

const { I18n } = window

const fixTags = s1 => s1.replaceAll('<', '&lt;').replaceAll('>', '&gt;')

const getDiff = (changes) => {
  if (typeof changes === 'string') {
    return htmldiff('', fixTags(changes))
  }

  return htmldiff(fixTags(changes[0]), fixTags(changes[1] || ''))
}

export const AiAssistantRevisions: React.FC<Props> = ({ aiAssistantId, onSelect }: Props) => {
  const config = {
    basePath: '/ai',
    responseType: AiAssistantTR,
  }
  const resource = useResources('assistants', config)

  const [list, setList] = useState<AIAssistantRevision[]>([])
  const [showDiff, setShowDiff] = useState<AIAssistantRevision | null>(null)
  const [computedDiffs, setComputedDiffs] = useState<ComputedDiffs | null>(null)

  useEffect(() => {
    setComputedDiffs(null)
    let timer: ReturnType<typeof setTimeout>

    if (showDiff) {
      timer = setTimeout(() => {
        const diffs: ComputedDiffs = {}
        if (showDiff.changes.name) diffs.name = getDiff(showDiff.changes.name)
        if (showDiff.changes.userPrompt) diffs.userPrompt = getDiff(showDiff.changes.userPrompt)
        if (showDiff.changes.systemPrompt) diffs.systemPrompt = getDiff(showDiff.changes.systemPrompt)
        setComputedDiffs(diffs)
      }, 0)
    }

    return () => clearTimeout(timer)
  }, [showDiff])

  useEffect(() => {
    resource.memberAction({
      id: aiAssistantId,
      action: 'revisions',
      method: 'get',
      responseType: AIAssistantRevisionsTR,
    }).then((response: AIAssistantRevision[]) => {
      setList(response)
    })
  }, [])

  const editRevision = (revision) => {
    const { name, systemPrompt, userPrompt } = revision.changes
    const values: { name?: string; systemPrompt?: string; userPrompt?: string } = {}
    if (name) {
      values.name = name[1]
    }
    if (systemPrompt) {
      values.systemPrompt = systemPrompt[1]
    }
    if (userPrompt) {
      values.userPrompt = userPrompt[1]
    }
    onSelect(values)
  }

  const revisionName = revision => `${I18n.t('admin.revisions_version')
  } ${
    revision.version
  } - ${
    new Date(revision.createdAt).toLocaleString()}`

  return (
    <Flex vertical>
      {list.map(revision => (
        <Flex key={revision.id} justify="space-between" align="center" style={{ marginBottom: '12px' }} gap={8}>
          <Typography.Text>
            {revisionName(revision)}
          </Typography.Text>
          <Flex gap={4}>
            <Button
              type="link"
              icon={<EyeOutlined />}
              loading={showDiff?.id === revision.id && !computedDiffs}
              onClick={() => setShowDiff(revision)}
            />
            <Tooltip title={I18n.t('admin.revisions_load')}>
              <Button icon={<ReloadOutlined />} onClick={() => editRevision(revision)} />
            </Tooltip>
          </Flex>
        </Flex>
      ))}

      <Modal
        open={!!showDiff}
        okText={I18n.t('admin.revisions_load')}
        onOk={() => { editRevision(showDiff); setShowDiff(null) }}
        onCancel={() => setShowDiff(null)}
        closable
        width="80vw"
        title={showDiff && revisionName(showDiff)}
      >

        {showDiff && (
          <>
            {computedDiffs?.name
              && (
                <Card title={I18n.t('shared.name')}>
                  <SafeHTML
                    className={cs(styles.editor, { [styles.diff]: showDiff })}
                    html={computedDiffs.name}
                    config="adminRichText"
                  />
                </Card>
              )}

            {computedDiffs?.userPrompt
              && (
                <Card title={I18n.t('admin.revisions_user_prompt')}>
                  <SafeHTML
                    className={cs(styles.editor, { [styles.diff]: showDiff })}
                    html={computedDiffs.userPrompt}
                    config="adminRichText"
                  />
                </Card>
              )}

            {computedDiffs?.systemPrompt
              && (
                <Card title={I18n.t('admin.revisions_system_prompt')}>
                  <SafeHTML
                    className={cs(styles.editor, { [styles.diff]: showDiff })}
                    html={computedDiffs.systemPrompt}
                    config="adminRichText"
                  />
                </Card>
              )}
          </>
        )}
      </Modal>
    </Flex>
  )
}
