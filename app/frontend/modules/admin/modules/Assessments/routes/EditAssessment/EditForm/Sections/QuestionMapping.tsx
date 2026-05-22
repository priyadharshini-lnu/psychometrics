import React, { useMemo, useState } from 'react'
import {
  Button, Select, Table, App,
} from 'antd'
import { useResources } from '~/hooks/useResources/useResources'
import { Assessment } from '~/modules/admin/modules/client/core/assessments'

const { I18n } = window

interface Props {
  assessment: Assessment
}

type MappingEntry = {
  micrositeQuestionId: string
  lighthouseQuestionId: string | null
}

export const QuestionMapping: React.FC<Props> = ({ assessment }) => {
  const { updateResource, isLoading } = useResources<Assessment>('assessments')
  const { message } = App.useApp()

  const initialMappings = useMemo(() => {
    const raw = assessment.externalSettings?.questionMappings
    if (!raw) return {}

    try {
      return JSON.parse(raw) as Record<string, string | null>
    } catch {
      return {}
    }
  }, [assessment.externalSettings?.questionMappings])

  const [mappings, setMappings] = useState<Record<string, string | null>>(initialMappings)

  const dataSource: MappingEntry[] = useMemo(
    () => Object.entries(mappings).map(([key, value]) => ({
      micrositeQuestionId: key,
      lighthouseQuestionId: value,
    })),
    [mappings],
  )

  const questionOptions = useMemo(
    () => (assessment.questions ?? []).map(q => ({
      value: q.id,
      label: `${q.name} (ID: ${q.id})`,
    })),
    [assessment.questions],
  )

  const handleValueChange = (micrositeQuestionId: string, value: string | null) => {
    setMappings(prev => ({ ...prev, [micrositeQuestionId]: value || null }))
  }

  const handleSave = () => {
    updateResource({
      id: assessment.id,
      externalSettings: {
        ...assessment.externalSettings,
        questionMappings: JSON.stringify(mappings),
      },
    })
      .then(() => {
        message.success(I18n.t('shared.updated_successfully'))
      })
  }

  const columns = [
    {
      title: I18n.t('admin.microsite_question_id'),
      dataIndex: 'micrositeQuestionId',
      key: 'micrositeQuestionId',
      width: 350,
    },
    {
      title: I18n.t('admin.lighthouse_question'),
      dataIndex: 'lighthouseQuestionId',
      key: 'lighthouseQuestionId',
      width: 350,
      render: (_: string | null, record: MappingEntry) => (
        <Select
          size="small"
          showSearch
          allowClear
          value={record.lighthouseQuestionId}
          onChange={value => handleValueChange(record.micrositeQuestionId, value)}
          placeholder={I18n.t('admin.select_question')}
          filterOption={(input, option) => (
            (option?.label as string)?.toLowerCase().includes(input.toLowerCase()) ?? false
          )}
          options={questionOptions}
          style={{ width: '100%' }}
        />
      ),
    },
  ]

  if (!Object.keys(mappings).length) {
    return <div>{I18n.t('admin.no_question_mappings')}</div>
  }

  return (
    <>
      <Table
        dataSource={dataSource}
        columns={columns}
        rowKey="micrositeQuestionId"
        pagination={false}
        size="small"
      />
      <Button
        type="primary"
        onClick={handleSave}
        loading={isLoading(`update@${assessment.id}`)}
        style={{ marginTop: 16 }}
      >
        {I18n.t('assessments.update')}
      </Button>
    </>
  )
}
