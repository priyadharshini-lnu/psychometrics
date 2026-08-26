import React, { useEffect } from 'react'
import {
  Card, Col, Row, Skeleton,
} from 'antd'
import { DataTablePagination } from '@thetalententerprise/glint'
import { useNavigate } from 'react-router-dom'
import { useResources } from '~/hooks/useResources'
import styles from './Dashboard.less'
import { DashboardTR, Dashboard as DashboardType } from '../../campaigns/core/dashboard'
import { settings } from '../settings'
import { DocumentTitle } from '~/components/DocumentTitle'

const { Meta } = Card
const { I18n } = window

export const DashboardList = () => {
  const navigate = useNavigate()
  const {
    data, fetch, isLoading, currentPage, pageSize, changePage, meta,
  } = useResources<DashboardType>('dashboards', { responseType: DashboardTR })

  useEffect(() => {
    fetch({
      apiConfig: {
        include: ['campaign'],
        fields: { campaigns: ['name'] },
        filter: { preview_available: 'true' },
      },
    })
  }, [])

  if (isLoading('fetch')) return <Skeleton />

  return (
    <div className="p-6">
      <DocumentTitle text={I18n.t('admin.dashboards')} />
      <h3>{I18n.t('admin.dashboards')}</h3>
      <Row>
        {data.map(dashboard => (
          <Col xl={6} md={8} sm={12} xs={24} key={dashboard.id} className={styles.cardContainer}>
            <Card
              hoverable
              cover={<CardCover imageUrl={dashboard.imageUrl} />}
              onClick={() => navigate(`${settings.urlPrefix}/${dashboard.id}`)}
            >
              <Meta title={dashboard.name} description={dashboard.campaign?.name} />
            </Card>
          </Col>
        ))}
      </Row>
      <DataTablePagination
        page={currentPage}
        pageSize={pageSize}
        total={meta.recordCount ?? 0}
        onChange={changePage}
      />
    </div>
  )
}

interface CardCoverProps {
  imageUrl: DashboardType['imageUrl']
}

const CardCover: React.FC<CardCoverProps> = ({ imageUrl }) => (
  <div className={styles.imageContainer} style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : {}}>
    {!imageUrl && <Skeleton.Image className={styles.imageSkeleton} />}
  </div>
)

export default DashboardList
