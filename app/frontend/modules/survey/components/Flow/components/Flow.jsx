import { Component } from 'react'
import { Modal } from 'antd'

import Tree from '~/libs/ReactTree'
import styles from './Flow.less'
import ButtonNew from './ButtonNew'
import FlowElement from './FlowElement'
import '~/libs/ReactTree/ReactUiTree.less'

export class Flow extends Component {
  save = () => {
    const { updateFlow, flow, close } = this.props
    updateFlow(flow)
    close()
  }

  cancel = () => {
    const { reset, close, assessment } = this.props
    reset(assessment.flow)
    close()
  }

  addNew = () => {
    const { addNew, flow } = this.props
    addNew(flow)
  }

  // Update state of component Tree
  // For re-render of tree dom
  updateTree = () => {
    // Build new tree
    const { tree } = this.props
    // Build new state for Tree component
    const newTreeState = this.tree.init({ tree, renderNode: this.renderElement, onChange: this.handleChange })
    // Set new state
    this.tree.setState(newTreeState)
    this.forceUpdate()
  }

  // Happens when tree was reorder
  // Update store flow
  handleChange = (tree) => {
    const { updateTree } = this.props
    updateTree(tree)
  }

  renderElement = (element, i) => {
    if (element.module === null) return null
    return (
      <div key={i} className={styles.node} draggable={false}>
        <FlowElement
          model={element.module}
          index={i}
          {...this.props}
        />
      </div>
    )
  }

  render () {
    const { tree } = this.props
    return (
      <Modal
        title="Assessment Flow"
        open
        width="80%"
        style={{ top: 20 }}
        onOk={this.save}
        okText="Save"
        onCancel={this.cancel}
        closable={false}
        maskClosable={false}
        keyboard={false}
      >
        <div>
          <div className={styles.tree}>
            <Tree
              paddingLeft={30}
              tree={tree}
              onChange={this.handleChange}
              renderNode={this.renderElement}
              handleClass="moveHandle"
              ref={(ref) => { this.tree = ref }}
            />
          </div>
          <div className={styles.row}>
            <ButtonNew onClick={this.addNew} />
          </div>
        </div>
      </Modal>
    )
  }
}

export default Flow
