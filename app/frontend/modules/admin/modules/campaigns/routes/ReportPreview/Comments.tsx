import React, { useEffect, useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import cs from 'classnames'
import {
  Input, Tooltip, Divider,
} from 'antd'
import {
  get,
  getCurrent,
  getModules,
  getCommentThreads,
  approveReport,
  readComment,
  getSelectedModule,
  Comment,
} from 'modules/admin/modules/campaigns/core/userReports'
import { RootState } from 'modules/admin/core/rootReducers'
import { SendOutlined } from '@ant-design/icons'
import { CommentItem } from 'glint/components/CommentItem'
import { CommentReply } from 'glint'
import { useResources } from 'hooks/useResources'
import Utils from 'modules/survey/utils'
import styles from './styles.less'

const connecter = connect((state: RootState) => ({
  userReport: getCurrent(state),
  comments: getCurrent(state).comments,
  threads: getCommentThreads(state),
  selectedModuleId: get(state).selectedModule,
  selectedModule: getSelectedModule(state),
  modules: getModules(state),
  permissions: state.currentUser.permissions,
}), {
  approveReport,
  readComment,
})

export type PropsFromRedux = ConnectedProps<typeof connecter>

type Props = PropsFromRedux & {
  scrollTo: (id:string) => void
}

const Compose = ({ selected, disabled, onSend }) => {
  const [value, setValue] = useState('')

  const keydown = (e) => {
    if (e.keyCode === 13) {
      submit()
    }
  }

  const submit = () => {
    onSend(value)
    setValue('')
  }

  return (
    <div className={styles.compose}>
      <div className={styles.hint}>
        {selected ? Utils.stripHTML(selected.props.text) : 'Select a text module to comment'}
      </div>
      <Input
        disabled={disabled}
        value={value}
        onChange={e => setValue(e.currentTarget.value)}
        onKeyUp={keydown}
        suffix={disabled ? (
          <Tooltip title="Select a text module first">
            <SendOutlined className={styles.send} />
          </Tooltip>
        ) : (
          <SendOutlined className={styles.send} onClick={submit} />
        )}
      />
    </div>
  )
}

function Comments ({
  comments, selectedModule, selectedModuleId, modules, userReport,
  readComment, scrollTo,
}: Props) {
  const {
    data, createResource, updateResource, setData, removeResource,
  } = useResources<Comment>('user_report_comments',
    { basePath: `user_reports/${userReport.id}` })

  useEffect(() => {
    setData(comments)
  }, [comments])

  const getThreadReplies = (id: string) => (
    data.filter(c => (c.parentId === id))
  )

  const threads = data.filter((c => !c.parentId)).reverse()
  const createComment = (text: string, parent?: Comment) => {
    const data: {text: string, parent?: {id: string}, reportsModule?: {id: string}} = {
      text,
    }
    if (parent) {
      data.reportsModule = { id: parent.moduleId }
      data.parent = { id: parent?.id }
    } else if (selectedModuleId) {
      data.reportsModule = { id: selectedModuleId.toString() }
    }
    createResource(data)
  }

  const updateComment = comment => new Promise((resolve) => {
    updateResource({
      id: comment.commentId,
      text: comment.commentText,
    }).then(resolve)
  })

  const resolveComment = (id: string) => {
    updateResource({
      id,
      resolved: true,
    })
  }

  const removeComment = (id:string) => {
    removeResource(id)
  }

  return (
    <div className={styles.comments}>
      <Compose selected={selectedModule} disabled={!selectedModuleId} onSend={createComment} />
      <Divider style={{ margin: 0 }} />
      {threads.map((thread) => {
        const module = modules.find(
          m => m.id.toString() === (thread.moduleId?.toString() || thread.reportsModule?.id),
        )
        return (
          <>
            <div className={
              cs(styles.thread, {
                [styles.highlighted]: selectedModuleId?.toString()
                  === thread.moduleId?.toString() || thread.reportsModule?.id,
              })}
            >
              <div className={styles.module} onClick={() => scrollTo(thread.moduleId)}>
                <Tooltip title={Utils.stripHTML(module?.props?.text)}>
                  <span className={styles.title}>Text</span>
                  {'| '}
                  {Utils.stripHTML(module?.props?.text)}
                </Tooltip>
              </div>
              <CommentItem
                canEdit
                canRemove
                canResolve
                comment={thread}
                onCommentEditSave={comment => updateComment(comment)}
                onCommentResolve={commentId => resolveComment(commentId)}
                onCommentRemove={commentId => removeComment(commentId)}
                onRead={readComment}
              />
              <Divider style={{ margin: '10px 0' }} />
              {getThreadReplies(thread.id).map(comment => (
                <CommentItem
                  canEdit
                  canRemove
                  comment={comment}
                  onCommentEditSave={comment => updateComment(comment)}
                  onCommentRemove={commentId => removeComment(commentId)}
                  onRead={readComment}
                />
              ))}
              <div className={styles.reply}>
                <CommentReply
                  onSendReply={text => createComment(text, thread)}
                  avatarUrl="" // TODO: replace with current user after implementation
                  inputLoading={false}
                />
              </div>
            </div>
            <Divider style={{ margin: '0' }} />
          </>
        )
      })}
    </div>
  )
}

export default connecter(Comments)
