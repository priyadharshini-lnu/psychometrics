import React, { FC } from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import { DetailsCard } from '~/glint'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import styles from './styles.less'

const STATUS = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  completed: 'Completed',
}

type StatusElementProps = {
  status: 'not_started' | 'in_progress' | 'completed'
}

const StatusElement: FC<StatusElementProps> = ({ status }) => <p className={styles[status]}>{STATUS[status]}</p>

export default {
  title: 'Components/DetailsCard',
  component: DetailsCard,
  args: {
    title: 'Card Title',
  },
  argTypes: {
    status: {
      control: false,
    },
  },
} as ComponentMeta<typeof DetailsCard>

const Template: ComponentStory<typeof DetailsCard> = args => <DetailsCard {...args}>Content Here</DetailsCard>

export const Simple = Template.bind({})
Simple.args = {
  buttonText: 'Begin',
  progressPercentage: 20,
  description: 'Description here',
  status: <StatusElement status="in_progress" />,
  subtitle: '15 minutes left',
}

export const StatusAtTopRow = Template.bind({})
StatusAtTopRow.args = {
  buttonText: 'Begin',
  progressPercentage: 20,
  description: 'Description here',
  status: <StatusElement status="not_started" />,
  subtitle: '15 minutes left',
  showStatusAtTop: true,
}

export const DisabledAction = Template.bind({})
DisabledAction.args = {
  buttonText: 'Begin',
  progressPercentage: 20,
  description: 'Description here',
  status: <StatusElement status="not_started" />,
  subtitle: '15 minutes left',
  showStatusAtTop: true,
  actionDisabled: true,
  actionDisabledText: 'wait before you proceed further',
}
