import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import { CommentItem } from '~/glint'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import styles from './styles.less'

export default {
  title: 'Components/CommentItem',
  component: CommentItem,
  argTypes: {
    status: {
      control: false,
    },
  },
} as ComponentMeta<typeof CommentItem>

const Template: ComponentStory<typeof CommentItem> = args => (
  <div className={styles.container}><CommentItem {...args} /></div>
)

const handleRemoveComment = (commentId) => {
  // eslint-disable-next-line no-console
  console.log('removed comment id: ', commentId)
}

export const Simple = Template.bind({})
Simple.args = {
  canRemove: true,
  canEdit: true,
  canResolve: true,
  comment: {
    id: '1',
    text: 'This is a comment',
    createdAt: '10:40 AM',
    resolved: true,
    creator: {
      fullName: 'Shivaraja',
      avatarUrl: 'avatar',
    },
  },
  onCommentRemove: handleRemoveComment,
  onCommentEditSave: null,
}
