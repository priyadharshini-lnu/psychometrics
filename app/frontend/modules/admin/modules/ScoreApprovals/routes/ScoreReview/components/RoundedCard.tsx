import { Card } from 'antd'

export const RoundedCard = ({ children, styles = {} }) => (
  <Card styles={{
    root: {
      borderRadius: 6,
      border: '1px solid #ccc',
    },
    body: {
      borderRadius: 6,
      padding: 12,
      ...styles,
    },
  }}
  >
    {children}
  </Card>
)
