
import React, { useEffect } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { Descriptions, Collapse, Button } from 'antd'
import { useParams, useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { ArrowLeftOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { RootState } from '~/modules/admin/core/rootReducers'
import { getCurrent, fetchCurrent } from '~/modules/admin/modules/AuditLog/core'
import { ReactCodemirror } from '~/glint/components/ReactCodemirror'
import styles from './styles.less'
import JsonDiff from './JsonDiff'
import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb'

const connecter = connect(
  (state: RootState) => ({
    single: getCurrent(state),
  }),
  {
    fetchCurrent,
  },
)

type Params = {
  id: string
}

export type PropsFromRedux = ConnectedProps<typeof connecter>
type Props = PropsFromRedux
const { I18n } = window

const AuditLogList: React.FC<Props> = ({
  single: record,
  fetchCurrent,
}) => {
  const { id } = useParams() as Params
  const navigate = useNavigate()
  useEffect(() => {
    fetchCurrent(id)
  }, [])

  if (!record) { return null }

  return (
    <>
      <Breadcrumb
        crumbs={[
          {
            link: () => '/admin',
            label: () => I18n.t('admin.dashboard'),
          },
          {
            link: () => '/admin/audit_logs',
            label: () => I18n.t('admin.audit_logs'),
          },
          {
            label: () => record.action,
          },
        ]}
      />
      <div className={styles.main}>
        <div className="flex align-center items-center mb-4">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
          >
            {I18n.t('shared.back')}
          </Button>
        </div>
        <Descriptions bordered column={1}>
          <Descriptions.Item label={I18n.t('shared.action')}>{record.action}</Descriptions.Item>
          <Descriptions.Item label={I18n.t('admin.audit_log_type')}>{record.recordType}</Descriptions.Item>
          <Descriptions.Item label={I18n.t('admin.record_id')}>{record.recordId}</Descriptions.Item>
          <Descriptions.Item label={I18n.t('admin.log_date')}>
            {dayjs(record.createdAt).format('lll')}
          </Descriptions.Item>
          <Descriptions.Item label={I18n.t('admin.user')}>
            {record.user ? `${record.user.fullName} (${record.user.email})` : record.userId}
          </Descriptions.Item>
          {record.impersonator && (
            <Descriptions.Item label={I18n.t('admin.audit_log_impersonated_by')}>
              {`${record.impersonator.fullName} (${record.impersonator.email})`}
            </Descriptions.Item>
          )}
          {record.requestUuid && (
            <Descriptions.Item label={I18n.t('admin.request_id')}>
              {record.requestUuid}
            </Descriptions.Item>
          )}
          {record.outcome && (
            <Descriptions.Item label={I18n.t('admin.outcome')}>
              {record.outcome}
            </Descriptions.Item>
          )}
          {record.failureReason && (
            <Descriptions.Item label={I18n.t('admin.failure_reason')}>
              {record.failureReason}
            </Descriptions.Item>
          )}
          {record.client && (
            <Descriptions.Item label="Client">
              <a href={`/admin/clients/${record.client.id}/projects`}>
                {record.client.id}
                ,
                {' '}
                {record.client.name}
              </a>
            </Descriptions.Item>
          )}
          <Descriptions.Item label={I18n.t('admin.interface')}>
            {record.interface}
          </Descriptions.Item>
          <Descriptions.Item label={I18n.t('admin.user_agent')}>
            {record.userAgent}
          </Descriptions.Item>
          <Descriptions.Item label={I18n.t('admin.client_ip')}>
            {record.clientIp}
          </Descriptions.Item>
          {record.project && (
            <Descriptions.Item label={I18n.t('admin.project')}>
              <a href={`/admin/projects/${record.project.id}/new_campaigns`}>
                {record.project.id}
                ,
                {' '}
                {record.project.name}

              </a>
            </Descriptions.Item>
          )}
          {record.campaign && (
            <Descriptions.Item label={I18n.t('admin.campaign')}>
              <a
                href={`/admin/projects/${record.campaign.projectId}/new_campaigns/${record.campaign.id}`}
              >
                {record.campaign.name}
              </a>
            </Descriptions.Item>
          )}
          <Descriptions.Item label={I18n.t('admin.payload')}>
            <ReactCodemirror
              value={JSON.stringify(record.payload, null, 2)}
              className={styles.payload}
              mode="json"
              readOnly
              lineWrapping
            />
          </Descriptions.Item>
        </Descriptions>
        {record.activeRecordAudits && record.activeRecordAudits?.length > 0 && (
          <>
            <Descriptions title={I18n.t('admin.active_record_audits_title')} className="mt-7" />
            <Collapse defaultActiveKey={['1']}>
              {record.activeRecordAudits?.map(audit => (
                <Collapse.Panel key={audit.id} header={`${audit.auditableType} - ${audit.auditableId}`}>
                  <Descriptions bordered className="mt-4" column={1}>
                    <Descriptions.Item label={I18n.t('admin.active_record_audits_audit_id')}>
                      {audit.id}
                    </Descriptions.Item>
                    <Descriptions.Item label={I18n.t('admin.active_record_audits_auditable_type')}>
                      {audit.auditableType}
                    </Descriptions.Item>
                    <Descriptions.Item label={I18n.t('admin.active_record_audits_auditable_id')}>
                      {audit.auditableId}
                    </Descriptions.Item>
                    <Descriptions.Item label={I18n.t('shared.action')}>
                      {audit.action}
                    </Descriptions.Item>
                    <Descriptions.Item label={I18n.t('admin.active_record_audits_audited_changes')}>
                      {(() => {
                        if (audit.action === 'update') {
                          return Object.keys(audit.auditedChanges).map(key => (
                            <div key={key} className="mt-5 mb-5">
                              {key}
                              :
                              <JsonDiff
                                oldChanges={audit.auditedChanges[key][0]}
                                newChanges={audit.auditedChanges[key][1]}
                              />
                            </div>
                          ))
                        } if (audit.action === 'create') {
                          return (
                            <JsonDiff
                              oldChanges={{}}
                              newChanges={audit.auditedChanges}
                            />
                          )
                        }
                        return (
                          <JsonDiff
                            oldChanges={audit.auditedChanges}
                            newChanges={{}}
                          />
                        )
                      })()}
                    </Descriptions.Item>

                  </Descriptions>
                </Collapse.Panel>
              ))}
            </Collapse>
          </>
        )}
      </div>
    </>
  )
}


export default connecter(AuditLogList)
