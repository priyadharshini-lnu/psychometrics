import React, { useState } from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import { Typography } from 'antd'
import { ClockCircleOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { CountdownTimer } from '~/glint/components/CountdownTimer'

const { Text } = Typography
export default {
  title: 'Components/CountdownTimer',
  component: CountdownTimer,
  argTypes: {
    valueStyle: {
      control: false,
    },
    prefix: {
      control: false,
    },
    onChange: {
      control: false,
    },
  },
  parameters: { actions: { argTypesRegex: 'onFinish' } },
} as ComponentMeta<typeof CountdownTimer>

const Template: ComponentStory<typeof CountdownTimer> = args => <CountdownTimer {...args} />

export const Simple = Template.bind({})
Simple.args = {
  seconds: 60 * 60 * 24 + 5,
  valueStyle: { fontSize: '14px' },
}

export const WithExpiry: ComponentStory<typeof CountdownTimer> = () => {
  const [showTimer, setShowTimer] = useState(true)

  const handleFinish = () => {
    setShowTimer(false)
  }

  const timedOut = (
    <Text type="secondary">
      <ClockCircleOutlined style={{ color: 'rgba(0, 0, 0, 0.45)' }} />
      {' '}
      Timed Out
    </Text>
  )

  return showTimer ? (
    <CountdownTimer
      seconds={5}
      valueStyle={{ fontSize: '14px' }}
      prefix={<ClockCircleOutlined style={{ color: '#009ea7' }} />}
      onFinish={handleFinish}
    />
  ) : (
    timedOut
  )
}

export const WithIcon = Template.bind({})
WithIcon.args = {
  seconds: 80,
  valueStyle: { fontSize: '14px' },
  prefix: <ClockCircleOutlined style={{ color: '#009ea7' }} />,
}

export const WithNotification = Template.bind({})
WithNotification.args = {
  seconds: 50,
  valueStyle: { fontSize: '14px' },
  prefix: <ClockCircleOutlined style={{ color: '#009ea7' }} />,
  notificationPoints: [
    { timeRemaining: 3600, type: 'info' },
    { timeRemaining: 1800, type: 'warning' },
    { timeRemaining: 900, type: 'error' },
  ],
  notificationTemplate: (minutes: number) => `${minutes} minutes left`,
}
