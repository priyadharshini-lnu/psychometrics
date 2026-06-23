import React, { useState } from 'react'
import {
  Flex, Typography, Row, Col, Alert, Skeleton, Button,
  Statistic,
} from 'antd'
import cs from 'classnames'
import ReactMarkdown from 'react-markdown'
import { EyeOutlined, EyeInvisibleOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import styles from '../styles.less'
import { SafeHTML } from '~/components/SafeHTML'

const { I18n } = window

interface ArtifactResult {
  key: string
  value: string | null
  type: string
}

interface ArtifactResultsProps {
  isLoading: boolean
  error: string | null
  artifactResults: ArtifactResult[]
  totalInputTokens: number | undefined
  totalOutputTokens: number | undefined
}

export const ArtifactResults: React.FC<ArtifactResultsProps> = ({
  isLoading,
  error,
  artifactResults,
  totalInputTokens = 0,
  totalOutputTokens = 0,
}) => {
  const [rawModeStates, setRawModeStates] = useState<Record<string, boolean>>({})

  const toggleRawMode = (key: string) => {
    setRawModeStates(prev => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const renderResult = (result: string, type: string, key: string) => {
    const isRawMode = rawModeStates[key]

    if (isRawMode && (type === 'markdown' || type === 'html')) {
      return <Typography.Text style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{result}</Typography.Text>
    }

    switch (type) {
      case 'markdown':
        return <ReactMarkdown>{result}</ReactMarkdown>
      case 'html':
        return <SafeHTML config="artifactResults" html={result} />
      default:
        return <Typography.Text>{result}</Typography.Text>
    }
  }

  return (
    <>
      {error && <Alert className="mb-0" message={error} type="error" style={{ whiteSpace: 'pre-wrap' }} />}
      {!error && (
        <Flex vertical>
          <Row>
            <Col
              span={6}
              className={cs('p-4 align-middle', styles.borderLight, styles.bgLight, styles.colorDarkGray)}
            >
              <Typography.Text strong>
                {I18n.t('admin.key')}
              </Typography.Text>
            </Col>
            <Col
              span={18}
              className={cs('p-4', styles.borderLight)}
            >
              <Typography.Text strong>
                {I18n.t('admin.generated_value')}
              </Typography.Text>
            </Col>
          </Row>
          {artifactResults.map((result: ArtifactResult) => (
            <Row key={result.key}>
              <Col
                span={6}
                className={cs('p-4 align-middle', styles.borderLight, styles.bgLight)}
              >
                <Skeleton loading={isLoading} active title paragraph={false}>
                  <Typography.Text className={styles.colorDarkGray}>
                    {result.key}
                  </Typography.Text>
                </Skeleton>
              </Col>
              <Col
                span={18}
                className={cs('p-4', styles.borderLight, styles.resultCell)}
              >
                <Skeleton loading={isLoading} active title paragraph={false}>
                  {result.value
                    ? renderResult(result.value, result.type, result.key)
                    : <Typography.Text>-</Typography.Text>
                  }
                </Skeleton>
                {result.value && (result.type === 'markdown' || result.type === 'html') && (
                  <Button
                    size="small"
                    color="default"
                    variant="filled"
                    icon={rawModeStates[result.key] ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                    onClick={() => toggleRawMode(result.key)}
                    className={styles.rawToggleButton}
                  >
                    {I18n.t('admin.raw')}
                  </Button>
                )}
              </Col>
            </Row>
          ))}
          <Row>
            <Col span={24} className={cs('p-4', styles.borderLight)}>
              <Skeleton loading={isLoading} active title paragraph={false}>
                <Typography.Text strong>
                  {I18n.t('admin.used_tokens_title')}
                </Typography.Text>
              </Skeleton>
            </Col>
          </Row>

          <Row className={cs(styles.borderLight)} style={{ padding: 12 }}>
            <Col span={12}>
              <Skeleton loading={isLoading} active title paragraph={false}>
                <Statistic
                  title={I18n.t('admin.used_tokens_input_tokens')}
                  value={totalInputTokens}
                  styles={{ content: { fontSize: 14 } }}
                />
              </Skeleton>
            </Col>
            <Col span={12}>
              <Skeleton loading={isLoading} active title paragraph={false}>
                <Statistic
                  title={I18n.t('admin.used_tokens_output_tokens')}
                  value={totalOutputTokens}
                  styles={{ content: { fontSize: 14 } }}
                />
              </Skeleton>
            </Col>
          </Row>
        </Flex>
      )}
    </>
  )
}
