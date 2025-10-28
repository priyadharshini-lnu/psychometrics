import React, {
  useMemo, useState, useEffect, useRef, useContext,
} from 'react'
import type { CollapseProps } from 'antd'
import cs from 'classnames'
import {
  Flex,
  Typography,
  Divider,
  Button,
  Tooltip,
  Collapse,
  Dropdown,
  MenuProps,
  Spin,
  Pagination, Tag, Badge,
} from 'antd'

import { UserIdpComment } from '~/modules/endUser/modules/campaigns/core/idp/userIdpPlan'
import styles from './Comments.less'
import { Filters, Pagination as PaginationParams } from './Types'
import { useFilters } from './useFilters'
import { CustomSender } from './CustomSender'
import { CommentItemHeader } from './CommentItemHeader'
import { CommentItemContent } from './CommentItemContent'
import {
  CheckOutlined,
  CloseOutlined,
  PlusOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  FilterOutlined,
  DeleteOutlined,
  FilterFilled,
} from '~/glint/icons/AccessibleIconsAntDesign'
import {
  MediaQueryContext,
} from '~/glint'

const { I18n } = window

export interface CommentsProps {
  comments: UserIdpComment[]
  totalCount?: number
  onAddComment: (content: string) => void
  onAddReply: (content: string, parentId: string) => void
  onResolveComment: (commentId: string) => void
  onUnresolveComment: (commentId: string) => void
  onScrollToSkill?: (resourceId: string) => void
  onClose?: () => void
  onTagClear?: () => void
  onCollapseChange?: (commentId: string) => void
  onFetchComments: (filters: Filters, pagination: PaginationParams) => void
  title?: string
  subtitle?: string
  className?: string
  style?: React.CSSProperties
  showCloseButton?: boolean
  loading?: boolean
  loadingReplies?: boolean
  openFirstComment?: boolean
  keyPrefix?: string
  pageSize?: number
  filteredSkillId?: string
}

export const Comments: React.FC<CommentsProps> = ({
  comments,
  totalCount,
  onAddComment,
  onAddReply,
  onResolveComment,
  onUnresolveComment,
  onScrollToSkill,
  onClose,
  onCollapseChange,
  onFetchComments,
  title = I18n.t('idp.comments.comments'),
  subtitle,
  className,
  style,
  showCloseButton = true,
  loading = false,
  loadingReplies = false,
  openFirstComment = false,
  keyPrefix,
  pageSize = 20,
  onTagClear,
  filteredSkillId,
}) => {
  const [showAddComment, setShowAddComment] = useState(false)
  const [comment, setComment] = useState('')
  const [reply, setReply] = useState('')
  const { filters, handleMenuClick, resetFilters } = useFilters()
  const [currentPage, setCurrentPage] = useState(1)
  const scrollableAreaRef = useRef<HTMLDivElement>(null)

  const showPagination = useMemo(() => totalCount && totalCount > pageSize, [totalCount, pageSize])

  const { isTablet } = useContext(MediaQueryContext)

  useEffect(() => {
    onFetchComments(filters, { page: 1, pageSize })
    setCurrentPage(1)
  }, [filters, pageSize])

  useEffect(() => {
    resetFilters()
  }, [filteredSkillId])

  const handleAddCommentClick = () => {
    setShowAddComment(true)
  }

  const handleCommentChange = (value: string) => {
    setComment(value)
  }

  const handleCommentSend = () => {
    onAddComment(comment)
    setComment('')
    setShowAddComment(false)
  }

  const handleReplyChange = (value: string) => {
    setReply(value)
  }

  const handleSend = (reply: string, commentId: string) => {
    onAddReply(reply, commentId)
    setReply('')
  }

  const handleCollapseChange = (key: string[]) => {
    if (key.length > 0 && onCollapseChange) {
      const commentId = key[0]
      const comment = comments.find(c => c.id.toString() === commentId)
      if (comment?.repliesCount && comment.repliesCount > 0) {
        onCollapseChange(commentId)
      }
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    onFetchComments(filters, { page, pageSize })

    if (scrollableAreaRef.current) {
      scrollableAreaRef.current.scrollTop = 0
    }
  }

  const filterMenuItems: MenuProps['items'] = [
    {
      key: 'sortBy',
      label: (
        <Flex gap={8} justify="space-between">
          <span>
            {I18n.t('idp.comments.sort_by_date')}
          </span>
          <Flex align="center" gap={4}>
            {filters.sortOrder === 'asc' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
          </Flex>
        </Flex>
      ),
    },
    {
      type: 'divider',
    },
    {
      key: 'showRead',
      label: (
        <Flex gap={8}>
          <span>{I18n.t('idp.comments.show_only_read')}</span>
          {filters.showRead === true && <CheckOutlined />}
        </Flex>
      ),
    },
    {
      key: 'showUnread',
      label: (
        <Flex gap={8}>
          <span>
            {I18n.t('idp.comments.show_only_unread')}
          </span>
          {filters.showUnread === true && <CheckOutlined />}
        </Flex>
      ),
    },
    {
      key: 'showResolved',
      label: (
        <Flex gap={8}>
          <span>
            {I18n.t('idp.comments.show_only_resolved')}
          </span>
          {filters.showResolved === true && <CheckOutlined />}
        </Flex>
      ),
    },
    {
      key: 'showUnresolved',
      label: (
        <Flex gap={8}>
          <span>{I18n.t('idp.comments.show_only_unresolved')}</span>
          {filters.showUnresolved === true && <CheckOutlined />}
        </Flex>
      ),
    },
  ]

  const collapseItems: CollapseProps['items'] = (comments || []).map((comment: UserIdpComment) => {
    const commentHeader = (
      <CommentItemHeader
        comment={comment}
        onResolveComment={onResolveComment}
        onUnresolveComment={onUnresolveComment}
        onScrollToSkill={onScrollToSkill}
      />
    )
    const commentContent = (
      <CommentItemContent
        comment={comment}
        loadingReplies={loadingReplies}
        reply={reply}
        handleReplyChange={handleReplyChange}
        handleSend={handleSend}
      />
    )


    return {
      key: keyPrefix ? `${keyPrefix}-${comment.id}` : comment.id,
      label: commentHeader,
      children: commentContent,
      className: cs(
        styles.commentItem, comment.resolvedAt ? styles.commentItemResolved : styles.commentItemUnresolved,
      ),
      showArrow: false,
      styles: {
        header: {
          padding: '0',
        },
        body: {
          padding: '0',
        },
      },
    }
  })

  return (
    <Flex
      vertical
      className={`${styles.commentsContainer} ${className || ''}`}
      style={style}
    >
      <div className={styles.header}>
        <Flex align="center" justify="space-between">
          <Flex vertical gap={4}>
            <Flex gap={4} align="center">
              <Typography.Title level={5} className={`${styles.headerTitle} m-0`}>
                {title}
              </Typography.Title>
              {totalCount && totalCount > 0 ? (
                <Typography.Text type="secondary" className={styles.headerTitleCount}>
                  { `(${totalCount})`}
                </Typography.Text>
              ) : null}
            </Flex>
            {subtitle && (
              isTablet ? <Typography.Text type="secondary">{subtitle}</Typography.Text>
                : (
                  <Tag closeIcon onClose={onTagClear} className={styles.headerSubtitle}>
                    {subtitle}
                  </Tag>
                )
            )}
          </Flex>

          <Flex align="center" style={{ alignSelf: 'flex-start' }}>
            {comments?.length > 0 && !loading ? (
              <Tooltip title={I18n.t('idp.comment_details.add_comment')}>
                <Button
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={handleAddCommentClick}
                  className="me-2"
                  style={{ fontSize: '1.125rem' }}
                />
              </Tooltip>
            ) : null}
            <Dropdown
              menu={{ items: filterMenuItems, onClick: handleMenuClick }}
              trigger={['click']}
              placement="bottomRight"
            >
              <Tooltip title={I18n.t('idp.comments.filter_comments')}>
                <Button
                  type="text"
                  size="small"
                  icon={Object.keys(filters).length > 2 ? (
                    <Badge dot>
                      <FilterFilled />
                    </Badge>
                  ) : <FilterOutlined />}
                  style={{ fontSize: '1.125rem' }}
                />
              </Tooltip>
            </Dropdown>
            {onClose && showCloseButton && (
              <Tooltip title={I18n.t('idp.comments.close')}>
                <Button
                  type="text"
                  size="small"
                  onClick={onClose}
                  icon={<CloseOutlined />}
                  style={{ fontSize: '1.125rem' }}
                />
              </Tooltip>
            )}
          </Flex>
        </Flex>
      </div>
      <Flex
        vertical
        className={styles.commentsContent}
      >
        {showAddComment || (comments?.length === 0 && !loading) ? (
          <>
            <div className={styles.addCommentSection}>
              <Flex vertical gap={16}>
                <Flex align="center" justify="space-between" gap={4}>
                  <Typography.Text strong>
                    {I18n.t('idp.comment_details.add_comment')}
                  </Typography.Text>
                  {!(comments?.length === 0 && !loading) ? (
                    <Button
                      type="text"
                      size="middle"
                      icon={<DeleteOutlined style={{ fontSize: '1.125rem' }} />}
                      onClick={() => setShowAddComment(false)}
                    />
                  ) : null}
                </Flex>
                <CustomSender
                  autoSize={{ maxRows: 2 }}
                  value={comment}
                  onChange={handleCommentChange}
                  onSubmit={handleCommentSend}
                  placeholder={I18n.t('idp.comment_details.add_comment_placeholder')}
                  className={styles.inputSender}
                />
              </Flex>
            </div>
            {!(comments?.length === 0 && !loading) ? (
              <Divider className="mb-0" />
            ) : (
              <div className={styles.commentItemTopSpacer} />
            )}
          </>
        ) : null}
        <div className={`${styles.scrollableArea}`} ref={scrollableAreaRef}>
          <Spin spinning={loading && currentPage === 1}>
            <Flex vertical gap={16}>
              {comments?.length > 0 && (
                <Collapse
                  bordered={false}
                  size="small"
                  accordion
                  onChange={handleCollapseChange}
                  items={collapseItems}
                  style={{ backgroundColor: 'transparent', height: '100%' }}
                  defaultActiveKey={openFirstComment ? `${keyPrefix}-${comments[0]?.id}` : undefined}
                />
              )}
              {!comments?.length && loading && (
                <div className={styles.loadingContainer} />
              )}
            </Flex>
          </Spin>
          {showPagination && totalCount && totalCount > 0 ? (
            <>
              <Divider className="mb-0 mt-0" />
              <Flex vertical gap={16} className="p-6">
                <Pagination
                  current={currentPage}
                  total={totalCount}
                  pageSize={pageSize}
                  onChange={handlePageChange}
                  size="small"
                />
              </Flex>
            </>
          ) : null}
        </div>
      </Flex>
    </Flex>
  )
}
