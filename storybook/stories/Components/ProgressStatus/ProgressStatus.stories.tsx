import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import { Col, Row } from 'antd'
import { CheckCircleOutlined, ClockCircleOutlined, PlayCircleOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { ProgressStatus } from '~/glint/components/ProgressStatus'

const ICON_CMPONENTS = {
  CheckIcon: CheckCircleOutlined,
  ClockIcon: ClockCircleOutlined,
  PlayIcon: PlayCircleOutlined,
}

export default {
  title: 'Components/ProgressStatus',
  component: ProgressStatus,
  argTypes: {
    backgroundColor: { table: { disable: true } },
  },
} as ComponentMeta<typeof ProgressStatus>

type Props = typeof ProgressStatus & {
  backgroundColor: string
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const Template: ComponentStory<Props> = ({ backgroundColor, StatusIcon, ...args }) => {
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
  const Icon = ICON_CMPONENTS[StatusIcon] || ICON_CMPONENTS.CheckIcon
  return (
    <div style={{ width: '20%' }}>
      <Row style={{ background: backgroundColor, padding: '12px' }}>
        <Col span={24}>
          <ProgressStatus StatusIcon={Icon} {...args} />
        </Col>
      </Row>
    </div>
  )
}
const MultiItemsTemplate: ComponentStory<typeof ProgressStatus> = () => (
  <div style={{ background: '#009ea7', padding: '12px' }}>
    <Row>
      <Col span={8}>
        <ProgressStatus theme="light" count={1} statusText="Not Started" StatusIcon={CheckCircleOutlined} />
      </Col>
      <Col span={8}>
        <ProgressStatus theme="light" count={1} statusText="In Progress" StatusIcon={ClockCircleOutlined} />
      </Col>
      <Col span={8}>
        <ProgressStatus theme="light" count={1} statusText="Completed" StatusIcon={PlayCircleOutlined} />
      </Col>
    </Row>
  </div>
)

export const Simple = Template.bind({})
Simple.argTypes = { StatusIcon: { control: 'select', options: Object.keys(ICON_CMPONENTS) } }
Simple.args = {
  backgroundColor: '#d3d3d3',
  count: '01',
  statusText: 'Not Started',
  StatusIcon: PlayCircleOutlined,
}

export const LightTheme = Template.bind({})
LightTheme.argTypes = { StatusIcon: { control: 'select', options: Object.keys(ICON_CMPONENTS) } }
LightTheme.args = {
  backgroundColor: '#009ea7',
  count: '01',
  statusText: 'Not Started',
  StatusIcon: PlayCircleOutlined,
  theme: 'light',
}

export const MultipleStatusItems = MultiItemsTemplate.bind({})
MultipleStatusItems.argTypes = { StatusIcon: { control: false } }
