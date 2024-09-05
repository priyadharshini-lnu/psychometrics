import React from 'react'
import {
  Form, Input, Select, Spin, Switch,
} from 'antd'
import { useParams } from 'react-router-dom'
import _ from 'lodash'
import { CreateResource, UpdateResource } from '~/hooks/useResources/interfaces'
import ResourceFormModal from '~/components/ResourceFormModal'
import { MettlScheduleRecord } from '~/modules/admin/modules/client/core/mettlScheduleRecords'
import { useResources } from '~/hooks/useResources'

const { I18n } = window

interface Props {
  addMettlScheduleRecord: CreateResource<MettlScheduleRecord | {projectIdId: string }>
  updateMettlScheduleRecord: UpdateResource<MettlScheduleRecord>
  mettlScheduleRecord: MettlScheduleRecord
  close(): void
}

interface Assessment {
  id: string,
  name: string,
}

export const AddEditMettlScheduleRecordModal: React.FC<Props> = ({
  addMettlScheduleRecord,
  updateMettlScheduleRecord,
  mettlScheduleRecord,
  close,
}) => {
  const { projectId } = useParams() as { projectId: string }

  const {
    data: assessments, fetch: fetchAssessments, isLoading,
  } = useResources<Assessment>('assessments')
  const assessmentsLoading = isLoading('fetch')

  const getAssessments = (): Assessment[] => {
    if (!mettlScheduleRecord || !mettlScheduleRecord.assessmentId) {
      return _.uniqBy(assessments, 'id')
    }

    return [
      {
        id: mettlScheduleRecord.assessmentId,
        name: mettlScheduleRecord.assessmentName,
      },
    ]
  }
  return (
    <>
      <ResourceFormModal
        resourceName="mettl_schedule_records"
        resource={mettlScheduleRecord}
        readableResourceName="Mettl Schedule Record"
        showSuccessMessages
        close={close}
        scrollToFirstError
        modalProps={{ width: 620 }}
        request={{
          createResource: values => addMettlScheduleRecord({ ...values }),
          updateResource: updateMettlScheduleRecord,
        }}
      >
        {() => (
          <>
            <Form.Item
              name="assessmentId"
              label={I18n.t('administration.projects.mettl_schedule_records.assessment_id')}
              rules={[{ required: true }]}
            >
              <Select
                disabled={!!mettlScheduleRecord}
                showSearch
                onSearch={(value) => {
                  fetchAssessments({
                    apiConfig: { filter: { category_eq: 'mettl', filterable_fields: value, project_id_eq: projectId } },
                  })
                }}
                notFoundContent={assessmentsLoading ? <Spin size="small" /> : null}
                filterOption={false}
              >
                {getAssessments().map(({ id, name }) => (
                  <Select.Option key={id} value={id}>
                    {name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="scheduleName"
              label={I18n.t('administration.projects.mettl_schedule_records.schedule_name')}
              rules={[{ required: true }]}
            >
              <Input name="scheduleName" disabled={!!mettlScheduleRecord} />
            </Form.Item>

            <Form.Item
              name="proctoringEnabled"
              label={I18n.t('administration.projects.mettl_schedule_records.proctoring_enabled')}
              valuePropName="checked"
              initialValue={mettlScheduleRecord?.proctoringEnabled || false}
            >
              <Switch />
            </Form.Item>
            <Form.Item
              name="secureBrowserEnabled"
              label={I18n.t('administration.projects.mettl_schedule_records.secure_browser_enabled')}
              valuePropName="checked"
              initialValue={mettlScheduleRecord?.secureBrowserEnabled || false}
            >
              <Switch />
            </Form.Item>
          </>
        )}
      </ResourceFormModal>
    </>
  )
}
