import React, { Component } from 'react'
import store from 'store/FlowStore'
import { Modal } from 'react-bootstrap'
import Tree from 'react-ui-tree'
import styles from './Flow.scss'
import ButtonNew from './ButtonNew'
import FlowElement from './FlowElement'
import 'react-ui-tree/dist/react-ui-tree.css'

const {
  Header, Body, Footer, Title,
} = Modal

export class Flow extends Component {
  componentDidMount () {
    this.storeListener = store.addListener('change', () => this.forceUpdate())
  }

  componentWillUnmount () {
    this.storeListener.remove()
  }

  save = () => {
    store.save()
  }

  cancel = () => {
    const { close } = this.props
    close()
  }

  addNew = () => {
    store.flow.newElement()
    this.updateTree()
  }

  // Update state of component Tree
  // For re-render of tree dom
  updateTree = () => {
    // Build new tree
    const tree = store.getTree()
    // Build new state for Tree component
    const newTreeState = this.tree.init({ tree, renderNode: this.renderElement, onChange: this.handleChange })
    // Set new state
    this.tree.setState(newTreeState)
    this.forceUpdate()
  }

  renderElement = (element, i) => {
    if (element.module === null) return null
    return (
      <div key={i} className={styles.node}>
        <FlowElement model={element.module} onUpdateStore={this.updateTree} />
      </div>
    )
  }

  // Happens when tree was reorder
  // Update store flow
  handleChange = (tree) => {
    store.updateFlowElements(tree)
    this.forceUpdate()
  }

  render () {
    const { show, tree, name } = this.props
    if (!show) { return null }
    return (
      <Modal show bsSize="lg" keyboard={false} dialogClassName={styles.modal}>
        <Header>
          <Title>
            Assessment Flow
            <span className={styles.title}>{name}</span>
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
