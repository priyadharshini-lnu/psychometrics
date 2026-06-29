import React, { useEffect, useState } from 'react'
import { Skeleton, message } from 'antd'
import styles from './EmbeddedDashboard.less'
import { Dashboard as DashboardType } from '~/modules/admin/modules/campaigns/core/dashboard'
import useAsyncRequestResponse from '~/hooks/useAsyncRequestResponse'
import {
  AsyncExternalAssessmentTR,
} from '~/modules/admin/modules/client/core/externalAssessments'

const { I18n } = window
interface OwnProps {
  dashboard: DashboardType
}

type Props = OwnProps


export const EmbeddedOracleAnalytics: React.FC<Props> = ({
  dashboard: { id, name },
}) => {
  const [embedToken, setEmbedToken] = useState<string | null>(null)

  const { asyncLoading, makeAsyncRequest } = useAsyncRequestResponse({
    url: `/administration/dashboards/${id}/get_embed_token`,
    data: { id },
    responseType: AsyncExternalAssessmentTR,
    onFailure: () => {
      message.error(I18n.t('admin.dashboard_loading_failed'))
    },
  })

  useEffect(() => {
    makeAsyncRequest().then((response) => {
      setEmbedToken(response.responseData)
    }).catch(() => {
      message.error(I18n.t('admin.dashboard_loading_failed'))
    })
  }, [])

  if (!id || asyncLoading) {
    return <Skeleton active />
  }

  return (
    <div className={styles.embedContainer}>
      {embedToken ? (
        <iframe
          src={`/administration/dashboards/${id}/oracle_analytics_embed?embed_token=${embedToken}`}
          title={name}
          width="100%"
          height="100%"
        />
      ) : (
        <></>
      )}
    </div>
  )
}
