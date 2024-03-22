import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CommentItem } from '~/glint'

global.React = React

describe('CommentItem', () => {
  const comment = {
    id: '1',
    text: 'Test comment',
    createdAt: '2023-06-30T12:00:00Z',
    resolved: false,
    isNew: false,
    creator: {
      fullName: 'John Doe',
      avatarUrl: 'https://example.com/avatar.jpg',
    },
  }

  const mockCommentRemove = vi.fn()
  const mockCommentEditSave = vi.fn(() => Promise.resolve())
  const mockCommentResolve = vi.fn()
  const mockCommentRead = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders comment text correctly', () => {
    render(<CommentItem comment={comment} />)
    const commentText = screen.getByText('Test comment')
    expect(commentText).toBeInTheDocument()
  })

  it('renders creator name correctly', () => {
    render(<CommentItem comment={comment} />)
    const creatorName = screen.getByText('John Doe')
    expect(creatorName).toBeInTheDocument()
  })

  it('calls onCommentRemove when remove menu item is clicked', async () => {
    const user = userEvent.setup()
    render(
      <CommentItem
        comment={comment}
        canRemove
        onCommentRemove={mockCommentRemove}
      />,
    )

    await user.click(screen.getByTestId(/more-options/i))

    // click remove menu item
    await user.click(screen.getByText(/Remove/i))

    // click modal delete button
    await user.click(screen.getByRole('button', { name: /delete/i }))
    expect(mockCommentRemove).toHaveBeenCalledWith('1')
  })

  it('calls onCommentEditSave when save button is clicked after editing comment', async () => {
    const user = userEvent.setup()
    render(
      <CommentItem
        comment={comment}
        canEdit
        onCommentEditSave={mockCommentEditSave}
      />,
    )

    await user.click(screen.getByTestId(/more-options/i))
    await user.click(screen.getByText(/edit/i))

    const commentInput = screen.getByRole('textbox')
    await user.clear(commentInput)
    await user.type(commentInput, 'Updated comment')

    await user.click(screen.getByText(/save/i))

    expect(mockCommentEditSave).toHaveBeenCalledWith({
      commentText: 'Updated comment',
      commentId: '1',
    })
  })

  it('calls onCommentResolve when resolve menu item is clicked', async () => {
    const user = userEvent.setup()
    render(
      <CommentItem
        comment={comment}
        canResolve
        onCommentResolve={mockCommentResolve}
      />,
    )

    await user.click(screen.getByTestId(/more-options/i))
    await user.click(screen.getByText(/resolve/i))

    expect(mockCommentResolve).toHaveBeenCalledWith('1', false)
  })

  it('calls onCommentResolve when unresolve menu item is clicked', async () => {
    const user = userEvent.setup()
    const resolvedComment = {
      ...comment,
      resolved: true,
    }

    render(
      <CommentItem
        comment={resolvedComment}
        canResolve
        onCommentResolve={mockCommentResolve}
      />,
    )

    await user.click(screen.getByTestId(/more-options/i))
    await user.click(screen.getByText(/unresolve/i))

    expect(mockCommentResolve).toHaveBeenCalledWith('1', true)
  })

  it('calls onRead when the comment is new and hovered over', async () => {
    const user = userEvent.setup()
    const newComment = {
      ...comment,
      isNew: true,
    }
    render(
      <CommentItem
        comment={newComment}
        onRead={mockCommentRead}
      />,
    )
    expect(screen.getByTestId(/comment-item/i)).toHaveClass('new')

    await user.hover(screen.getByTestId(/comment-item/i))
    expect(mockCommentRead).toHaveBeenCalledWith('1')
  })
})
