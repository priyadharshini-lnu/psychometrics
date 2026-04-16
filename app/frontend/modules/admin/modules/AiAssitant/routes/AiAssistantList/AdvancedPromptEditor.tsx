import React, { useState, useRef, useEffect } from 'react'
import {
  Button, Input, Card, Typography, Row, Col, Spin, message, Tooltip, Space,
} from 'antd'
import { Controlled as CodeMirror } from 'react-codemirror2'
import { PlayCircleOutlined, InfoCircleOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { useResources } from '~/hooks/useResources/useResources'
import 'codemirror/lib/codemirror.css'
import styles from './styles.less'

type AdvancedPromptEditorProps = {
  value?: string
  onChange?: (value: string) => void
  campaignId?: string
}

const { I18n } = window

export const AdvancedPromptEditor: React.FC<AdvancedPromptEditorProps> = ({
  value,
  onChange,
  campaignId: campaignIdProp,
}) => {
  const [campaignId, setCampaignId] = useState<string>(campaignIdProp || '')
  const [renderedOutput, setRenderedOutput] = useState<string>('')
  const [isRendering, setIsRendering] = useState<boolean>(false)
  const codemirrorRef = useRef(null)

  const { collectionAction } = useResources('assistants', {
    basePath: 'ai',
  })

  useEffect(() => {
    setTimeout(() => {
      if (!codemirrorRef.current) return
      const codemirror = codemirrorRef.current as { editor?: { refresh: () => void } }
      codemirror.editor?.refresh()
    }, 100)
  }, [])

  const handleTestRender = async () => {
    if (!value || !campaignId) {
      message.warning(I18n.t('admin.ai_assistants_template_and_campaign_required'))
      return
    }

    setIsRendering(true)
    try {
      const response = await collectionAction({
        action: 'render_prompt_template',
        method: 'post',
        body: {
          template: value,
          campaign_id: campaignId,
        },
      }) as { attributes: { renderedPrompt: string } }

      setRenderedOutput(response.attributes.renderedPrompt)
    } catch (error) {
      if (error.base) {
        setRenderedOutput(error.base[0]?.detail)
      }
      message.error(I18n.t('admin.ai_assistants_template_render_failed'))
    } finally {
      setIsRendering(false)
    }
  }

  const codemirrorOptions = {
    lineNumbers: true,
    theme: 'default',
    lineWrapping: true,
    foldGutter: true,
    gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
  }

  return (
    <div className={styles['advanced-prompt-editor']}>
      <div className={styles['advanced-prompt-editor-code-wrapper']}>
        <CodeMirror
          ref={codemirrorRef}
          value={value || ''}
          options={codemirrorOptions}
          onBeforeChange={(_editor, _data, val) => {
            if (onChange) onChange(val)
          }}
        />
      </div>

      <Card
        size="small"
        title={(
          <Row align="middle" gutter={8}>
            <Col>
              {I18n.t('admin.ai_assistants_test_render')}
            </Col>
            <Col>
              <Tooltip
                title={I18n.t('admin.ai_assistants_test_render_tooltip')}
              >
                <span><InfoCircleOutlined style={{ cursor: 'pointer', color: '#1890ff' }} /></span>
              </Tooltip>
            </Col>
          </Row>
        )}
        className={styles['advanced-prompt-editor-test-card']}
      >
        <Row gutter={[16, 16]} align="middle">
          {!campaignIdProp && (
            <Col span={8}>
              <Space.Compact style={{ width: '100%' }}>
                <Input
                  disabled
                  value={I18n.t('shared.campaign_id')}
                  style={{ width: 'auto', cursor: 'default' }}
                />
                <Input
                  placeholder={I18n.t('admin.ai_assistants_campaign_id_placeholder')}
                  value={campaignId}
                  onChange={e => setCampaignId(e.target.value)}
                />
              </Space.Compact>
            </Col>
          )}
          <Col>
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={handleTestRender}
              loading={isRendering}
              disabled={!value || !campaignId}
            >
              {I18n.t('admin.ai_assistants_render_button')}
            </Button>
          </Col>
        </Row>

        {(renderedOutput || isRendering) && (
          <div className={styles['advanced-prompt-editor-rendered-output']}>
            <Typography.Text strong className={styles['advanced-prompt-editor-output-label']}>
              {I18n.t('admin.ai_assistants_rendered_prompt')}
              :
            </Typography.Text>
            <div className={styles['advanced-prompt-editor-output-content']}>
              {isRendering ? (
                <div className={styles['advanced-prompt-editor-output-spinner']}>
                  <Spin />
                </div>
              ) : (
                renderedOutput || I18n.t('admin.ai_assistants_no_rendered_output')
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
