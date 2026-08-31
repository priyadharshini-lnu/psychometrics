import React, { useState } from 'react'
import {
  Button, Input, Card, Typography, Row, Col, Spin, Tooltip, Space, useApp,
} from '@thetalententerprise/glint'
import { PlayCircleOutlined, InfoCircleOutlined } from '@thetalententerprise/glint/icons'
import { useResources } from '~/hooks/useResources/useResources'
import { ReactCodemirror } from '~/glint/components/ReactCodemirror'
import styles from './styles.less'
import { baseErrorMessage } from '~/hooks/useResources/utils'

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
  const { message } = useApp()

  const { collectionAction } = useResources('assistants', {
    basePath: 'ai',
  })

  const handleTestRender = async () => {
    if (!value || !campaignId) {
      message.warning(I18n.t('admin.template_and_campaign_required'))
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
        setRenderedOutput(baseErrorMessage(error, 'detail'))
      }
      message.error(I18n.t('admin.template_render_failed'))
    } finally {
      setIsRendering(false)
    }
  }

  return (
    <div className={styles['advanced-prompt-editor']}>
      <div className={styles['advanced-prompt-editor-code-wrapper']}>
        <ReactCodemirror
          value={value || ''}
          onChange={onChange}
          lineNumbers
          lineWrapping
          foldGutter
        />
      </div>

      <Card
        size="small"
        title={(
          <Row align="middle" gutter={8}>
            <Col>
              {I18n.t('admin.test_render')}
            </Col>
            <Col>
              <Tooltip
                title={I18n.t('admin.test_render_tooltip')}
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
                  placeholder={I18n.t('admin.campaign_id_placeholder')}
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
              {I18n.t('admin.render_button')}
            </Button>
          </Col>
        </Row>

        {(renderedOutput || isRendering) && (
          <div className={styles['advanced-prompt-editor-rendered-output']}>
            <Typography.Text strong className={styles['advanced-prompt-editor-output-label']}>
              {I18n.t('admin.rendered_prompt')}
              :
            </Typography.Text>
            <div className={styles['advanced-prompt-editor-output-content']}>
              {isRendering ? (
                <div className={styles['advanced-prompt-editor-output-spinner']}>
                  <Spin />
                </div>
              ) : (
                renderedOutput || I18n.t('admin.no_rendered_output')
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
