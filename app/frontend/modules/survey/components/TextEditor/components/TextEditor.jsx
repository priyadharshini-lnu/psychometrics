import {
  Component, useRef, useLayoutEffect,
} from 'react'
import ContentEditable from 'react-contenteditable'

import { SafeHTML } from '~/components/SafeHTML'

import styles from './TextEditor.less'

export class TextEditor extends Component {
  hover = false

  constructor (props) {
    super(props)
    this.state = {
      edit: false,
      normal: true,
      value: props.value,
    }
    this.editor = null
  }

  componentDidUpdate (prevProps) {
    const { value: propsValue } = this.props
    const { value: stateValue } = prevProps
    if (propsValue !== prevProps.value && stateValue !== propsValue) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ value: propsValue })
    }
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (this.editor) {
      return nextState.value !== this.editor.innerHTML
    }
    return true
  }

  onRichChange = (data) => {
    const { onChange } = this.props
    this.setState({ value: data })
    onChange && onChange(data)
  }

  edit = () => {
    const { value } = this.props
    this.hover = true
    this.setState({ edit: true, value })
  }

  selectElementContents = (el) => {
    document.activeElement.blur()
    el.focus()
  }


  blur = () => {
    if (this.hover) { return }
    const { onChange } = this.props
    const { value } = this.state
    this.setState({ edit: false })
    onChange && onChange(value.trim())
  }


  keyup = (e) => {
    const { value } = this.state
    const { value: initialValue, onChange } = this.props
    if (e.keyCode === 27) {
      this.setState({ edit: false, value: initialValue })
    }
    if (e.keyCode === 9) {
      this.setState({ edit: false })
      onChange && onChange(value)
    }
  }

  change = (e) => {
    this.setState({ value: e.currentTarget.value })
  }


  mouseEnter = () => {
    this.hover = true
  }

  mouseLeave = () => {
    this.hover = false
  }

  normalMode = () => {
    this.setState({ normal: true })
  }

  htmlMode = () => {
    this.setState({ normal: false })
  }

  openRichEditor = () => {
    const { openRichEditor } = this.props
    const { value } = this.state
    this.setState({ edit: false })
    openRichEditor({ value, onSave: this.onRichChange })
  }

  changeText = (e) => {
    this.setState({ value: e.target.value })
  }


  renderText () {
    const { styles: css } = this.props
    const { value } = this.state
    return (
      <div
        className={`${styles.editable} ${css}`}
        onClick={this.edit}
      >
        <SafeHTML html={value} config="adminRichText" />
      </div>
    )
  }

  renderEdit () {
    const { normal, value } = this.state
    return (
      <div className={styles.container} onMouseEnter={this.mouseEnter} onMouseLeave={this.mouseLeave}>
        {normal ? (
          <ContentEdit
            onBlur={this.blur}
            onChange={this.changeText}
            onKeyDown={this.keyup}
            html={value}
            selectElementContents={this.selectElementContents}
          />
        )
          : (
            <HtmlEdit
              value={value}
              onChange={this.change}
              onBlur={this.blur}
              selectElementContents={this.selectElementContents}
              onKeyDown={this.keyup}
            />
          )}
        <div onClick={this.openRichEditor} className={`${styles.richEditBtn} ${styles.richEditBtnFloat}`}>
          <span className={`fa fa-font ${styles.icon}`} />
          Rich Content Editor...
        </div>
        <div
          onClick={this.htmlMode}
          className={`${styles.richEditBtn} ${styles.htmlEditBtn} ${normal && styles.disabled}`}
        >
          <span className={`fa fa-font ${styles.icon}`} />
          HTML View
        </div>
        <div
          onClick={this.normalMode}
          className={`${styles.richEditBtn} ${styles.normalEditBtn} ${!normal && styles.disabled}`}
        >
          <span className={`fa fa-font ${styles.icon}`} />
          Normal View
        </div>
      </div>
    )
  }

  render () {
    const { edit } = this.state
    return (edit ? this.renderEdit() : this.renderText())
  }
}

const HtmlEdit = ({
  value, onChange, onBlur, selectElementContents, onKeyDown,
}) => {
  const editor = useRef()
  useLayoutEffect(() => {
    if (editor.current) {
      selectElementContents(editor.current)
    }
  }, [])
  return (
    <textarea
      ref={editor}
      className={styles.editor}
      onChange={onChange}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      type="text"
      autoComplete="off"
      value={value}
    />
  )
}

const ContentEdit = ({
  html, onChange, onBlur, selectElementContents, onKeyDown,
}) => {
  const editor = useRef()
  useLayoutEffect(() => {
    if (editor.current) {
      selectElementContents(editor.current)
    }
  }, [])
  return (
    <ContentEditable
      innerRef={editor}
      className={`${styles.editor} spellcheck-enabled`}
      onBlur={onBlur}
      onChange={onChange}
      onKeyDown={onKeyDown}
      html={html}
    />
  )
}


export default TextEditor
