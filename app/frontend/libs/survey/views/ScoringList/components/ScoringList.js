import React, { Component } from 'react'
import store from 'store/FactorList'
import blockListStore from 'store/BlockList'
import Scoring from 'views/Scoring'
import styles from './ScoringList.scss'

export class ScoringList extends Component {
  storeListener = null

  componentDidMount () {
    this.storeListener = store.addListener('change', () => this.forceUpdate())
  }

  componentWillUnmount () {
    this.storeListener.remove()
  }

  renderScoring () {
    const { type } = this.props
    return (
      <div className={styles.main}>
        {blockListStore.list.map((block, i) => (
          <div className={`panel panel-default ${styles.blockContainer}`} key={i}>
            <div className="panel-heading">{block.name}</div>
            <div className="panel-body">
              {block.questions.list.map((question, j) => <Scoring type={type} key={j} model={question} />)}
            </div>
          </div>
        ))}
      </div>
    )
  }

  renderError () {
    return (
      <div>Relative dimension has not factors for scoring</div>
    )
  }

  render () {
    return (store.currentFactor ? this.renderScoring() : this.renderError())
  }
}

export default ScoringList
