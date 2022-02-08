
import React, { useEffect } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { getCurrent, fetchCurrent } from 'modules/admin/modules/AuditLog/core'
import { withRouter, RouteComponentProps, Link } from 'react-router-dom'
import { RootState } from 'modules/admin/core/rootReducers'
import { Descriptions } from 'antd'
import { UnControlled as CodeMirror } from 'react-codemirror2'
import styles from './styles.scss'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/addon/fold/foldcode'
import 'codemirror/addon/fold/foldgutter'
import 'codemirror/addon/fold/brace-fold'
import 'codemirror/addon/fold/foldgutter.css'

const connecter = connect(
  (state: RootState) => ({
    single: getCurrent(state),
  }),
  {
    fetchCurrent,
  },
)

interface Params {
  id: string
}

export type PropsFromRedux = ConnectedProps<typeof connecter>
type Props = PropsFromRedux & RouteComponentProps<Params>
const { I18n } = window

const AuditLogList: React.FC<Props> = ({
  single: record, match: { params: { id } },
  fetchCurrent,
}) => {
  useEffect(() => {
    fetchCurrent(id)
  }, [])

  if (!record) { return null }

  return (
    <div className={styles.main}>
      <Descriptions title={I18n.t('administration.audit_log.title')} bordered column={1}>
        <Descriptions.Item label={I18n.t('administration.audit_log.action')}>{record.action}</Descriptions.Item>
        <Descriptions.Item label={I18n.t('administration.audit_log.type')}>{record.recordType}</Descriptions.Item>
        <Descriptions.Item label={I18n.t('administration.audit_log.record_id')}>{record.recordId}</Descriptions.Item>
        <Descriptions.Item label={I18n.t('administration.audit_log.user')}>{record.userName}</Descriptions.Item>
        {record.client && (
          <Descriptions.Item label="Client">
            <a href={`/administration/clients/${record.client.id}/projects`}>
              {record.client.id}
              ,
              {' '}
              {record.client.name}
            </a>
          </Descriptions.Item>
        )}
        {record.project && (
          <Descriptions.Item label={I18n.t('administration.audit_log.project')}>
            <Link to={`/administration/projects/${record.project.id}/new_campaigns`}>
              {record.project.id}
              ,
              {' '}
              {record.project.name}

            </Link>
          </Descriptions.Item>
        )}
        {record.campaign && (
          <Descriptions.Item label={I18n.t('administration.audit_log.campaign')}>
            <Link
              to={`/administration/projects/${record.campaign.projectId}/new_campaigns/${record.campaign.id}`}
            >
              {record.campaign.name}
            </Link>
          </Descriptions.Item>
        )}
        <Descriptions.Item label={I18n.t('administration.audit_log.payload')}>
          <CodeMirror
            value={JSON.stringify(record.payload)}
            options={{
              mode: {
                name: 'javascript',
                json: true,
              },
              lineWrapping: true,
            }}
          />
        </Descriptions.Item>
      </Descriptions>
    </div>
  )
}


export default connecter(withRouter(AuditLogList))
