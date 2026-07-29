import { useMemo } from 'react'
import { Select, Spin } from 'antd'
import { getAvailableAssessments } from './assessmentSearchUtils'
import './assessmentSelect.css'

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
  const availableAssessments = useMemo(
    () => getAvailableAssessments(allAssessments, selectedAssessments),
    [allAssessments, selectedAssessments],
  )

  const handleChange = (value?: string) => {
    onSearch?.('')
    if (!value) return
    onAssessmentSelect(value)
  }

  return (
    <Select
      value={null}
      allowClear
      showSearch={{
        filterOption: false,
      }}
      autoFocus
      onSearch={value => onSearch?.(value)}
      onChange={handleChange}
      onClear={() => onSearch?.('')}
      loading={isLoading}
      placeholder={I18n.t('admin.form_select_assessment')}
      getPopupContainer={triggerNode => triggerNode.parentElement}
      notFoundContent={
        isLoading ? (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <Spin size="small" />
          </div>
        ) : (
          I18n.t('admin.no_assessments_found')
        )
      }
      style={{ width: '100%' }}
      popupClassName="assessment-select-popup"
      options={availableAssessments.map(assessment => ({
        key: assessment.id,
        label: (
          <div
            style={{
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              overflow: 'visible',
              padding: '4px 0',
            }}
          >
            {assessment.name}
          </div>
        ),
        value: assessment.id.toString(),
        title: assessment.name,
      }))}
    />
  )
}
