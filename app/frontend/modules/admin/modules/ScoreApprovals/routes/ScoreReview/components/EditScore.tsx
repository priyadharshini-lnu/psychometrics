import { useState } from 'react'
import {
  Flex, Button, Space, InputNumber, Switch,
  Typography,
  Input,
} from 'antd'

const { I18n } = window

export const EditScore = ({
  value, onSubmit, onClose, notApplicable: initialNA = false,
}) => {
  const [tempValue, setTempValue] = useState(value)
  const [reason, setReason] = useState('')
  const [notApplicable, setNotApplicable] = useState(initialNA)
  const [showScoreWarning, setShowScoreWarning] = useState(false)

  const isBlankScore = tempValue === null || tempValue === undefined

  const handleChange = (value) => {
    setTempValue(value)
    if (showScoreWarning && value !== null && value !== undefined) {
      setShowScoreWarning(false)
    }
  }

  const onSave = (e) => {
    e.stopPropagation()

    if (!notApplicable && isBlankScore) {
      setShowScoreWarning(true)
      return
    }

    onSubmit({ score: tempValue, reason, notApplicable })
  }

  const onToggleNotApplicable = () => {
    const nextValue = !notApplicable
    setNotApplicable(nextValue)

    if (nextValue) {
      setShowScoreWarning(false)
    }
  }

  return (
    <Flex orientation="vertical" gap={12} style={{ width: 300 }} onClick={e => e.stopPropagation()}>
      <Typography.Text strong>Edit Score</Typography.Text>
      <Space>
        <Switch checked={notApplicable} onChange={onToggleNotApplicable} />
        {' '}
        {I18n.t('admin.score_not_applicable')}
      </Space>
      <Flex orientation="vertical" gap={4}>
        <Typography.Text>{I18n.t('admin.new_score')}</Typography.Text>
        <InputNumber disabled={notApplicable} value={tempValue} onChange={handleChange} style={{ width: '100%' }} />
        {showScoreWarning && !notApplicable && (
          <Typography.Text type="danger">{I18n.t('validations.blank')}</Typography.Text>
        )}
      </Flex>
      <Flex orientation="vertical" gap={4}>
        <Typography.Text>{I18n.t('admin.reason_for_changes')}</Typography.Text>
        <Input.TextArea rows={4} value={reason} onChange={e => setReason(e.target.value)} />
      </Flex>
      <Space>
        <Button onClick={onClose}>{I18n.t('shared.cancel')}</Button>
        <Button type="primary" onClick={onSave}>{I18n.t('shared.submit')}</Button>
      </Space>
    </Flex>
  )
}
