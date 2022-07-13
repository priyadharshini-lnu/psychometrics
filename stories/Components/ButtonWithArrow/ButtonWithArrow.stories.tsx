import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import '../../../app/frontend/styles/ant.less'
import { ButtonWithArrow } from '../../../app/frontend/glint/components/ButtonWithArrow'

import '../../../app/frontend/styles/utils.less'

export default {
  title: 'Components/ButtonWithArrow',
  component: ButtonWithArrow,
} as ComponentMeta<typeof ButtonWithArrow>

const Template: ComponentStory<typeof ButtonWithArrow> = args => <ButtonWithArrow {...args} />

export const Default = Template.bind({})

Default.args = {
  label: 'Begin',
  block: true,
}

export const Primary = Template.bind({})
Primary.args = {
  label: 'Login',
  type: 'primary',
  block: true,
}
