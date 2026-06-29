import { useState } from 'react'
import { Select, Form } from 'antd'

const { I18n } = window

type AssessmentOption = {
  id: string | number
  name: string
}

type Props = {
  allAssessments: AssessmentOption[]
  selectedAssessments: Set<string>
  onAssessmentSelect: (assessmentId: string) => void
  onSearch?: (searchValue: string) => void
  isLoading?: boolean
}

export const AddAssessmentForm: React.FC<Props> = ({
  allAssessments,
  selectedAssessments,
  onAssessmentSelect,
  onSearch,
  isLoading = false,
}) => {
  const [form] = Form.useForm()
  const [selectedValue, setSelectedValue] = useState<string | undefined>(undefined)

  const handleChange = (value: string) => {
    setSelectedValue(undefined)
    form.resetFields()
    onAssessmentSelect(value)
  }

  const availableAssessments = allAssessments.filter(
    assessment => !selectedAssessments.has(assessment.id.toString()),
  )

  return (
    <Form form={form}>
      <Form.Item name="assessment">
        <Select
          value={selectedValue}
          onChange={handleChange}
          allowClear
          showSearch={{ filterOption: false, onSearch }}
          loading={isLoading}
          placeholder={I18n.t('admin.form_select_assessment')}
          notFoundContent={isLoading ? I18n.t('shared.loading') : I18n.t('admin.no_assessments_found')}
          options={availableAssessments.map(assessment => ({
            key: assessment.id,
            label: assessment.name,
            value: assessment.id.toString(),
          }))}
        />
      </Form.Item>
    </Form>
  )
}
