import { FC } from 'react'
import { Button, ButtonProps } from 'antd'

type FillScoringButtonProps = {
  hasScore: boolean
  onClick: () => void
} & Omit<ButtonProps, 'onClick' | 'color' | 'variant'|'style'>

export const FillScoringButton: FC<FillScoringButtonProps> = ({ hasScore, ...props }) => (
  <Button
    color="primary"
    variant="outlined"
    style={{ width: '70px', fontWeight: 'bold' }}
    {...props}
  >
    {hasScore ? 'Clear' : 'Fill'}
  </Button>
)
