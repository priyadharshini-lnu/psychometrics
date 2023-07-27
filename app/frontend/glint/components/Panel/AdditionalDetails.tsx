import React from 'react'
import { Descriptions } from 'antd'
import _ from 'lodash'
import cs from 'classnames'
import { AdditionsDetailsData } from './interfaces'
import styles from './Panel.less'

interface AdditionsDetailsProps {
  additionalDetails: AdditionsDetailsData
  layout?: 'horizontal' | 'vertical'
  className?: string
}

export const AdditionalDetails: React.FC<AdditionsDetailsProps> = ({
  additionalDetails, layout = 'vertical', className,
}) => (
  <div className={cs(styles.additionalDetailsContainer, className)}>
    <Descriptions layout={layout} column={layout === 'horizontal' ? 0 : additionalDetails.length} size="small">
      {_.map(additionalDetails, data => (
        <Descriptions.Item label={data.label} key={data.label}>{data.value}</Descriptions.Item>
      ))}
    </Descriptions>
  </div>
)
