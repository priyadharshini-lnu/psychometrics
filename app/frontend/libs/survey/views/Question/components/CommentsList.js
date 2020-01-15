import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { perform } from 'libs/survey/core/temp/socket'
import styles from './Question.scss'

class CommentsList extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  state = {
    edit: false,
    value: '',
    hideDiscussion: false,
  }

  showForm = () => {
    this.setState({ edit: true })
  }

  addComment = () => {
    const { model, addComment } = this.props
    const { value } = this.state

    if (value.trim()) {
      const comment = { text: value }
      perform('comment_create', { question_id: model.id, ...comment }, (data) => {
        Object.assign(comment, { id: data.id, name: data.author, date: data.created_at })

        addComment(model, comment)
        this.setState({ edit: false, value: '' })
      })
    }
  }

  removeComment = (comment) => {
    const { model, removeComment } = this.props
    perform('comment_destroy', { id: comment.id }, () => {
      removeComment(model, comment)
    })
  }

  onChange = (e) => {
    this.setState({ value: e.currentTarget.value })
  }

  toggleShow = () => {
    const { hideDiscussion } = this.state
    this.setState({ hideDiscussion: !hideDiscussion })
  }

  keyDown = (e) => {
    if (e.keyCode === 13) {
      this.addComment()
    }
  }

  comment = (comment, i) => {
    const date = new Date(comment.date)

    return (
      <div className={`item item-visible ${styles.item}`} key={i}>
        <div className={`text ${styles.itemText}`}>
          <div className="heading">
            <a className={styles.remove} onClick={this.removeComment.bind(this, comment)}>
              <span className="fa fa-remove" />
            </a>
            <a>{comment.name}</a>
            <span className="date">{`${date.getHours()}:${date.getMinutes()}`}</span>
          </div>
          <span>{comment.text}</span>
        </div>
      </div>
    )
  }

  form () {
    const { edit } = this.state
    return (
      <div className="input-group col-sm-8">
        {this.buttons()}
        {edit
        && <input onKeyDown={this.keyDown} onChange={this.onChange} type="text" className="form-control" />}
        {edit && (
        <span className="input-group-btn">
          <button onClick={this.addComment} className="btn btn-default" type="button">Post</button>
        </span>
        )}
      </div>
    )
  }

  buttons () {
    const { model } = this.props
    const { hideDiscussion, edit } = this.state
    return (
      <span className="input-group-btn">
        {model.comments.length && (
          <button onClick={this.toggleShow} className="btn btn-default" type="button">
            {hideDiscussion ? 'Show' : 'Hide'}
            {' '}
            Discussion
          </button>
        )}
        {!edit
          && <button onClick={this.showForm} className="btn btn-default" type="button">Add Comment</button>}
      </span>
    )
  }

  list (list) {
    const { hideDiscussion } = this.state
    if (hideDiscussion) {
      return null
    }
    if (!list.length) {
      return null
    }
    return (
      <div className={`messages ${styles.messages}`}>
        {list.map(this.comment)}
      </div>
    )
  }

  render () {
    const { model: { comments } } = this.props

    return (
      <div>
        {this.list(comments)}

        <div className={`messages ${styles.messagesForm}`}>
          {this.form()}
        </div>
      </div>
    )
  }
}

export default CommentsList
