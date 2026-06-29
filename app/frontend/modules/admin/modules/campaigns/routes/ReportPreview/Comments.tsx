import { useEffect, useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import cs from 'classnames'
import {
  Input, Tooltip, Divider, Switch, Space,
} from 'antd'
import { useTransition, animated as a } from 'react-spring'
import _ from 'lodash'
import { SendOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import {
  get,
  getCurrent,
  getModules,
  getCommentThreads,
  approveReport,
  readComment,
  getSelectedModule,
  Comment,
  Module,
} from '~/modules/admin/modules/campaigns/core/userReports'
import { RootState } from '~/modules/admin/core/rootReducers'
import { useResources } from '~/hooks/useResources'
import Utils from '~/modules/survey/utils'
import { CommentReply } from '~/glint'
import { CommentItem } from '~/glint/components/CommentItem'
import styles from './styles.less'

const connecter = connect((state: RootState) => ({
  userReport: getCurrent(state),
  comments: getCurrent(state).comments,
  threads: getCommentThreads(state),
  selectedModuleId: get(state).selectedModule,
  selectedModule: getSelectedModule(state),
  modules: getModules(state),
  permissions: state.currentUser.permissions,
  currentUser: state.currentUser,
}), {
  approveReport,
  readComment,
})

const { I18n } = window

export type PropsFromRedux = ConnectedProps<typeof connecter>

type Props = PropsFromRedux & {
  scrollToModule: (id:string) => void,
  pageModules: {page: {}, modules: Module[]}[]
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
        {selected ? selected.name : I18n.t('admin.reports_preview_info_to_select_module')}
      </div>
      <Input
        disabled={disabled}
        value={value}
        onChange={e => setValue(e.currentTarget.value)}
        onKeyUp={keydown}
        suffix={disabled ? (
          <Tooltip title={I18n.t('admin.reports_preview_info_to_select_module')}>
            <span><SendOutlined className={styles.send} /></span>
          </Tooltip>
        ) : (
          <SendOutlined className={styles.send} onClick={submit} />
        )}
      />
    </div>
  )
}

function Comments ({
  comments, selectedModule, selectedModuleId, modules, userReport, currentUser,
  pageModules, readComment, scrollToModule,
}: Props) {
  const {
    data, createResource, updateResource, setData, removeResource,
  } = useResources<Comment>('user_report_comments',
    {
      basePath: `user_reports/${userReport.id}`,
      apiConfig: {
        include: ['creator'],
        fields: {
          users: ['full_name'],
        },
      },
    })

  const [hideResolved, setHideResolved] = useState(true)
  useEffect(() => {
    setData(comments)
  }, [])

  const getThreadReplies = (id: string) => (
    _.sortBy(data.filter(c => ((c.parentId || c.parent?.id)?.toString() === id.toString())), 'id')
  )
  const orderedModules = _.flatten(pageModules.map(p => p.modules))

  const orderedThreads = orderedModules.reduce((threads, module) => {
    const comments = data.filter((c => (
      c.reportsModule && !c.parent
        ? c
        : !(c.parentId) && (c.moduleId?.toString() === module.id.toString())
    )))

    return [...threads, ...comments.filter(c => !_.find(threads, { id: c.id }))]
  }, [])

  const threads = hideResolved ? orderedThreads.filter(thread => !thread.resolved) : orderedThreads
  const createComment = (text: string, parent?: Comment) => {
    const data: {text: string, parent?: {id: string}, reportsModule?: {id: string}} = {
      text,
    }
    if (parent) {
      data.reportsModule = { id: parent.moduleId || parent.reportsModule?.id }
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

  const resolveComment = (id: string, resolved: boolean) => {
    updateResource({
      id,
      resolved: !resolved,
    })
  }

  const removeComment = (id:string) => {
    removeResource(id)
  }

  const transition = useTransition(threads, {
    from: { opacity: 0 },
    enter: { opacity: 1, delay: 200 },
    leave: { opacity: 0 },
    key: c => c.id,
  })

  return (
    <div className={styles.comments}>
      <div className={styles.filters}>
        <Space>
          <span>{I18n.t('admin.reports_preview_hide_resolved')}</span>
          <Switch checked={hideResolved} onChange={() => setHideResolved(!hideResolved)} />
        </Space>
      </div>
      <Compose selected={selectedModule} disabled={!selectedModuleId} onSend={createComment} />
      <Divider style={{ margin: 0 }} />

      {transition((style, thread) => {
        const module = modules.find(
          m => m.id.toString() === (thread.moduleId?.toString() || thread.reportsModule?.id),
        )
        return (
          <a.div style={{ ...style }} key={thread.id}>
            <div
              key={thread.id}
              className={
              cs(styles.thread, {
                [styles.highlighted]: selectedModuleId && (selectedModuleId.toString()
                  === (thread.moduleId?.toString() || thread.reportsModule?.id?.toString())),
              })}
            >
              <div
                className={styles.module}
                onClick={() => scrollToModule(thread.moduleId || thread.reportsModule?.id)}
              >
                <Tooltip title={Utils.stripHTML(module?.props?.text)}>
                  <span className={styles.title}>Text</span>
                  {'| '}
                  {Utils.stripHTML(module?.props?.text)}
                </Tooltip>
              </div>
              <CommentItem
                canEdit={thread.creator.id.toString() === currentUser.id.toString()}
                canRemove={thread.creator.id.toString() === currentUser.id.toString()}
                canResolve
                comment={thread}
                onCommentEditSave={comment => updateComment(comment)}
                onCommentResolve={(commentId, resolved) => resolveComment(commentId, resolved)}
                onCommentRemove={commentId => removeComment(commentId)}
                onRead={readComment}
              />
              <Divider style={{ margin: '10px 0' }} />
              {getThreadReplies(thread.id.toString()).map(comment => (
                <CommentItem
                  key={comment.id}
                  canEdit={comment.creator.id.toString() === currentUser.id.toString()}
                  canRemove={comment.creator.id.toString() === currentUser.id.toString()}
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
          </a.div>
        )
      })}
    </div>
  )
}

export default connecter(Comments)
