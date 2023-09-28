import React from 'react'
import { Divider, Typography } from 'antd'
import { AdditionsDetailsData } from './interfaces'
import { AdditionalDetails } from './AdditionalDetails'
import styles from './Panel.less'

interface Props {
  title: string
  description?: string
  additionalDetails?: AdditionsDetailsData
}

export const PanelTitle: React.FC<Props> = ({
  title,
  description,
  additionalDetails,
}) => (
  <>
    <Typography.Title
      level={3}
      className={styles.title}
    >
      {title}
    </Typography.Title>
    <Typography.Text type="secondary">
      {description}
    </Typography.Text>
    {additionalDetails && (
      <>
        <Divider />
        <AdditionalDetails additionalDetails={additionalDetails} layout="vertical" />
      </>
    )}
  </>
)
