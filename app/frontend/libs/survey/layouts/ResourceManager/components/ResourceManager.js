import React, { Component } from 'react'
import DndProvider from 'components/DnD/DnDProvider'
import DndElement from 'components/DnD/DnDElement'
import utils from 'libs/survey/utils'
import styles from './ResourceManager.scss'
import Header from './Header'
import Resource from './Resource'

export default class ResourceManager extends Component {
  componentDidMount () {
    const { subscribeSocket, socketInitialized, loadAssessments } = this.props
    const urldata = location.pathname.match(/assessments\/(\d+)/)
    const id = urldata && urldata[1]
    if (!socketInitialized) {
      subscribeSocket('Assessments::Channel', { assessment_id: id })
    }
    loadAssessments(id)
  }

  loading () {
    return (
      <div className={styles.loading}>
        <i className={`fa fa-refresh fa-spin fa-fw ${styles.icon}`} />
        <span className={styles.loadingLabel}>Saving...</span>
      </div>
    )
  }

  render () {
    const { resources, reorderResources } = this.props
    const onDrag = (list) => {
      reorderResources(list)
    }
    const list = resources.map(r => ({ id: utils.genId(), ...r }))

    return (
      <div className="col-md-12">
        <div className="panel panel-default">
          <Header {...this.props} />
          <DndProvider>
            <div className={styles.resourceWrapper}>
              {list.map((resource, index) => (
                <DndElement
                  className={styles.dragable}
                  iconClass={styles.iconHandler}
                  strategy="index"
                  uniqField="id"
                  element={resource}
                  list={list}
                  onDrag={onDrag}
                >
                  <Resource
                    index={index}
                    resource={resource}
                    {...this.props}
                  />
                </DndElement>
              ))}
            </div>
          </DndProvider>
        </div>
        <div className="clearfix" />
      </div>
    )
  }
}
