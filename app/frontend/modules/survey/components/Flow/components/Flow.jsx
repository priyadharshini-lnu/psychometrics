import { useEffect, useRef } from 'react'
import { Modal } from 'antd'
import { useSelector } from 'react-redux'
import Tree from '~/libs/ReactTree'
import styles from './Flow.less'
import ButtonNew from './ButtonNew'
import FlowElement from './FlowElement'
import '~/libs/ReactTree/ReactUiTree.less'

const Flow = (props) => {
  const ref = useRef()
  const flow = useSelector((state => state.survey.builder.flow))
  const { tree, close } = props

  useEffect(() => {
    const { reset, assessment } = props
    reset(assessment.flow)
  }, [])

  const save = () => {
    const { updateFlow } = props
    updateFlow(flow)
    close()
  }

  const cancel = () => {
    const { reset, assessment } = props
    reset(assessment.flow)
    close()
  }

  const addNew = () => {
    const { addNewElement } = props
    addNewElement(flow)
  }

  // Update state of component Tree
  // For re-render of tree dom
  const updateTree = () => {
    if (!ref.current) { return }

    const { tree } = props
    // Build new state for Tree component
    // props.updateElements(tree)
    const newTreeState = ref.current.init({ tree, renderNode: renderElement, onChange: handleChange })
    // Set new state
    ref.current.setState(newTreeState)
  }

  // Happens when tree was reorder
  // Update store flow
  const handleChange = (tree) => {
    const { updateElements } = props
    updateTree(tree)
    updateElements(tree.children)
  }

  const renderElement = (element, i, parent = null) => {
    if (element.module === null) return null

    return (
      <div key={element.uuid} className={styles.node} draggable={false}>
        <FlowElement
          path={element.module.path}
          model={element.module}
          index={i}
          parent={parent}
          {...props}
        />
      </div>
    )
  }

  return (
    <Modal
      title="Assessment Flow"
      open
      width="80%"
      style={{ top: 20 }}
      onOk={save}
      okText="Save"
      onCancel={cancel}
      closable={false}
      mask={{ closable: false }}
      keyboard={false}
      focusable={{ trap: false }}
    >
      <div>
        <div className={styles.tree}>
          <Tree
            paddingLeft={30}
            tree={tree}
            onChange={handleChange}
            renderNode={renderElement}
            handleClass="moveHandle"
            ref={ref}
          />
        </div>
        <div className={styles.row}>
          <ButtonNew onClick={addNew} />
        </div>
      </div>
    </Modal>
  )
}

export default Flow
