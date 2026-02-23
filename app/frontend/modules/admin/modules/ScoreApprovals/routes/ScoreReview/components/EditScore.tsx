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
  const handleChange = (value) => {
    setTempValue(value)
  }

  const onSave = (e) => {
    e.stopPropagation()
    onSubmit({ score: tempValue, reason, notApplicable })
  }

  return (
    <Flex orientation="vertical" gap={12} style={{ width: 300 }} onClick={e => e.stopPropagation()}>
      <Typography.Text strong>Edit Score</Typography.Text>
      <Space>
        <Switch checked={notApplicable} onChange={() => setNotApplicable(!notApplicable)} />
        {' '}
        {I18n.t('admin.ai_scoring_appoval_score_not_applicable')}
      </Space>
      <Flex orientation="vertical" gap={4}>
        <Typography.Text>{I18n.t('admin.ai_scoring_appoval_new_score')}</Typography.Text>
        <InputNumber disabled={notApplicable} value={tempValue} onChange={handleChange} style={{ width: '100%' }} />
      </Flex>
      <Flex orientation="vertical" gap={4}>
        <Typography.Text>{I18n.t('admin.ai_scoring_appoval_reason_for_changes')}</Typography.Text>
        <Input.TextArea rows={4} value={reason} onChange={e => setReason(e.target.value)} />
      </Flex>
      <Space>
        <Button onClick={onClose}>{I18n.t('shared.cancel')}</Button>
        <Button type="primary" onClick={onSave}>{I18n.t('shared.submit')}</Button>
      </Space>
    </Flex>
  )
}
