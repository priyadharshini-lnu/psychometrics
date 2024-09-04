import { Typography } from 'antd'
import { BoxWithShadow } from '~/glint'

// replace all inline styles with List.less

export const Plan = () => (
  <>
    <BoxWithShadow style={{ padding: '16px', marginTop: 16, minHeight: 400 }}>
      <Typography.Title level={4}>Behavioral Placeholder</Typography.Title>
    </BoxWithShadow>
    <BoxWithShadow style={{ padding: '16px', marginTop: 24, minHeight: 400 }}>
      <Typography.Title level={4}>Technical placegolder</Typography.Title>
    </BoxWithShadow>
  </>
)
