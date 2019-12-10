import React, { Component } from 'react'
import { Modal } from 'react-bootstrap'
import Tree from 'libs/react-tree'
import AppStore from 'store/AppStore'
import styles from './Flow.scss'
import ButtonNew from './ButtonNew'
import FlowElement from './FlowElement'
import 'libs/react-tree/react-ui-tree.scss'

const {
  Header, Body, Footer, Title,
} = Modal

export class Flow extends Component {
  save = () => {
    const { flow, close } = this.props
    AppStore.assessment.flow = flow
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

  renderElement = (element, i) => {
    if (element.module === null) return null
    return (
      <div key={i} className={styles.node} draggable={false}>
        <FlowElement
          model={element.module}
          {...this.props}
        />
      </div>
    )
  }

  // Happens when tree was reorder
  // Update store flow
  handleChange = (tree) => {
    const { updateTree } = this.props
    updateTree(tree)
  }

  render () {
    const { show, tree, assessment } = this.props
    if (!show) { return null }
    return (
      <Modal show bsSize="lg" keyboard={false} dialogClassName={styles.modal}>
        <Header>
          <Title>
            Assessment Flow
            <span className={styles.title}>{assessment.name}</span>
          </Title>
        </Header>
        <Body bsClass={styles.body}>
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
        </Body>
        <Footer>
          <button className="btn btn-success" onClick={this.save}>Save</button>
          <button className="btn btn-danger" onClick={this.cancel}>Cancel</button>
        </Footer>
      </Modal>
    )
  }
}

export default Flow
