import React from 'react'
import { Descriptions } from 'antd'
import _ from 'lodash'
import { AdditionsDetailsData } from './interfaces'
import styles from './Panel.less'

interface AdditionsDetailsProps {
  additionalDetails: AdditionsDetailsData
  layout?: 'horizontal' | 'vertical'
}

export const AdditionalDetails: React.FC<AdditionsDetailsProps> = ({ additionalDetails, layout = 'vertical' }) => (
  <div className={styles.additionalDetailsContainer}>
    <Descriptions layout={layout} column={layout === 'horizontal' ? 0 : additionalDetails.length} size="small">
      {_.map(additionalDetails, data => (
        <Descriptions.Item label={data.label} key={data.label}>{data.value}</Descriptions.Item>
      ))}
    </Descriptions>
  </div>
)
