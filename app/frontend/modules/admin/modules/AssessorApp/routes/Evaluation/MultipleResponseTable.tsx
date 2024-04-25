import { Button, Space, Table } from 'antd'
import _ from 'lodash'
import { FC } from 'react'
import { formatedDate } from '~/utils/time'
import { AssessorAssessment } from '../../core/evaluation'

const { I18n } = window

interface Props {
  assessorAssessments: AssessorAssessment[]
  onView: (id: number) => void
}

export const MultipleResponseTable: FC<Props> = ({ assessorAssessments, onView }) => {
  const viewAssessment = (id) => {
    onView(id)
  }

  const columns = [
    {
      title: I18n.t('common.column.name'),
      render (assessment) {
        return `${assessment.name} #${assessment.id}`
      },
    },
    {
      title: I18n.t('administration.assessor.completed_at'),
      render (assessment) {
        return assessment.completed_at ? formatedDate(assessment.completed_at) : null
      },
    },
    {
      title: I18n.t('assessments.actions.view'),
      render (assessorAssessment) {
        return (
          <Button type="link" onClick={() => viewAssessment(assessorAssessment.id)}>
            {assessorAssessment.status === 'completed'
              ? I18n.t('assessments.actions.view') : I18n.t('assessments.actions.evaluate')}
          </Button>
        )
      },
    },
  ]
  const lastAssessment = _.last(assessorAssessments)

  return (
    <div className="p-4">
      <Space className="w-100" direction="vertical">
        <Table dataSource={assessorAssessments} columns={columns} pagination={false} />
        {lastAssessment?.status === 'completed' && (
          <div className="ta-e">
            <Button type="primary" href={`/assessors/evaluations/${lastAssessment.id}/new_response`}>
              {I18n.t('assessments.actions.new_response', { locale: I18n.uiLocale })}
            </Button>
          </div>
        )}
      </Space>
    </div>
  )
}
