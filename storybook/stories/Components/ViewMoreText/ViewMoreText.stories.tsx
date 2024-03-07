import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import { ViewMoreText } from '~/glint/components/ViewMoreText'

export default {
  title: 'Components/ViewMoreText',
  component: ViewMoreText,
} as ComponentMeta<typeof ViewMoreText>

const Template: ComponentStory<typeof ViewMoreText> = args => <ViewMoreText {...args}>Content Here</ViewMoreText>

export const Simple = Template.bind({})
Simple.args = {
  text: `Lorem Ipsum is simply dummy text of the printing and typesetting industry.Lorem Ipsum
    has been the industry's standard dummy text ever since the 1500s, when an unknown printer
    took a galley of type and scrambled it to make a type specimen book. It has survived not
    only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.
    Lorem Ipsum is simply dummy text of the printing and typesetting industry.Lorem Ipsum
    has been the industry's standard dummy text ever since the 1500s, when an unknown printer
    took a galley of type and scrambled it to make a type specimen book. It has survived not
    only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.`,
  maxTextLen: 80,
  viewMoreLinkText: 'View more',
  viewLessLinkText: 'Show less',
}

export const WithInsufficientText = Template.bind({})
WithInsufficientText.args = {
  text: `Lorem Ipsum is simply dummy text of the printing and typesetting industry.Lorem Ipsum
  has been the industry's standard dummy text ever since the 1500s, when an unknown printer
  took a galley of type and scrambled it to make a type specimen book. It has survived not
  only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.`,
  maxTextLen: 380,
  viewMoreLinkText: 'View more',
  viewLessLinkText: 'Show less',
}
