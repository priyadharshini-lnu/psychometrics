import React, { useState } from 'react'
import {
  Form, Input, InputNumber, Select, Spin, Switch, Row, Col,
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
  const [visualProctoringEnabled, setVisualProctoringEnabled] = useState<boolean>(
    mettlScheduleRecord?.visualProctoringSettings?.enabled || false,
  )
  const [webProctoringEnabled, setWebProctoringEnabled] = useState<boolean>(
    mettlScheduleRecord?.webProctoringSettings?.enabled || false,
  )

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
        modalProps={{ width: 720 }}
        request={{
          createResource: values => addMettlScheduleRecord({ ...values }),
          updateResource: updateMettlScheduleRecord,
        }}
      >
        {() => (
          <>
            <Row style={{ marginTop: 30 }}>
              <Col span={5}>
                <label>{I18n.t('admin.projects_mettl_schedule_records_assessment_id')}</label>
              </Col>
              <Col span={18}>
                <Form.Item
                  name="assessmentId"
                  rules={[{ required: true }]}
                >
                  <Select
                    disabled={!!mettlScheduleRecord}
                    showSearch={{
                      filterOption: false,
                      onSearch: (value) => {
                        fetchAssessments({
                          apiConfig: {
                            filter: { category_eq: 'mettl', filterable_fields: value, project_id_eq: projectId },
                          },
                        })
                      },
                    }}
                    notFoundContent={assessmentsLoading ? <Spin size="small" /> : I18n.t('shared.no_results_found')}
                  >
                    {getAssessments().map(({ id, name }) => (
                      <Select.Option key={id} value={id}>
                        {name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={5}>
                <label>{I18n.t('admin.projects_mettl_schedule_records_schedule_name')}</label>
              </Col>
              <Col span={18}>
                <Form.Item
                  name="scheduleName"
                  rules={[{ required: true }]}
                >
                  <Input name="scheduleName" disabled={!!mettlScheduleRecord} />
                </Form.Item>
              </Col>
            </Row>

            <Row>
              <Col span={5}>
                <Form.Item
                  name="secureBrowserEnabled"
                  valuePropName="checked"
                  initialValue={mettlScheduleRecord?.secureBrowserEnabled || false}
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={18}>
                <label>{I18n.t('admin.projects_mettl_schedule_records_secure_browser_enabled')}</label>
              </Col>
            </Row>


            <Row style={{ height: 40 }}>
              <Col span={5}>
                <Form.Item
                  name={['visual_proctoring_settings', 'enabled']}
                  valuePropName="checked"
                  initialValue={mettlScheduleRecord?.visualProctoringSettings?.enabled || false}
                >
                  <Switch
                    checked={visualProctoringEnabled}
                    onChange={checked => setVisualProctoringEnabled(checked)}
                  />
                </Form.Item>
              </Col>
              <Col span={18}>
                <label>{I18n.t('admin.projects_mettl_schedule_records_visual_proctoring_enabled')}</label>
              </Col>
            </Row>

            {visualProctoringEnabled && (
              <>
                <Row style={{ height: 40 }}>
                  <Col span={5} />
                  <Col span={4}>
                    <Form.Item
                      name={['visual_proctoring_settings', 'candidate_screen_capture']}
                      valuePropName="checked"
                      initialValue={mettlScheduleRecord?.visualProctoringSettings?.candidateScreenCapture || false}
                    >
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col span={14}>
                    {I18n.t('admin.projects_mettl_schedule_records_candidate_screen_capture')}
                  </Col>
                </Row>


                <Row>
                  <Col span={5} />
                  <Col span={4}>
                    <Form.Item
                      name={['visual_proctoring_settings', 'candidate_authorization']}
                      valuePropName="checked"
                      initialValue={mettlScheduleRecord?.visualProctoringSettings?.candidateAuthorization || false}
                    >
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col span={14}>
                    {I18n.t('admin.projects_mettl_schedule_records_candidate_authorization')}
                  </Col>
                </Row>
              </>
            )}

            <Row style={{ height: 40 }}>
              <Col span={5}>
                <Form.Item
                  name={['web_proctoring_settings', 'enabled']}
                  valuePropName="checked"
                  initialValue={mettlScheduleRecord?.webProctoringSettings?.enabled || false}
                >
                  <Switch
                    checked={webProctoringEnabled}
                    onChange={checked => setWebProctoringEnabled(checked)}
                  />
                </Form.Item>
              </Col>
              <Col span={18}>
                <label>{I18n.t('admin.projects_mettl_schedule_records_web_proctoring_enabled')}</label>
              </Col>
            </Row>

            {webProctoringEnabled && (
              <>
                <Row style={{ height: 40 }}>
                  <Col span={5} />
                  <Col span={4}>
                    <Form.Item
                      name={['web_proctoring_settings', 'show_remaining_counts']}
                      valuePropName="checked"
                      initialValue={mettlScheduleRecord?.webProctoringSettings?.showRemainingCounts || false}
                    >
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col span={14}>
                    {I18n.t('admin.projects_mettl_schedule_records_show_remaining_counts')}
                  </Col>
                </Row>


                <Row style={{ height: 40 }}>
                  <Col span={5} />
                  <Col span={4}>
                    <Form.Item
                      name={['web_proctoring_settings', 'count']}
                      initialValue={mettlScheduleRecord?.webProctoringSettings?.count}
                      rules={[{ required: true }]}
                    >
                      <InputNumber size="small" style={{ width: 60 }} min={0} />
                    </Form.Item>
                  </Col>
                  <Col span={14}>
                    {I18n.t('admin.projects_mettl_schedule_records_count')}
                  </Col>
                </Row>
              </>
            )}
          </>
        )}
      </ResourceFormModal>
    </>
  )
}
