import { useEffect } from 'react'
import utils from '~/modules/survey/utils'
import DndElement from '~/components/DnD/DnDElement'
import styles from './ResourceManager.less'
import Header from './Header'
import Resource from './Resource'

export default function ResourceManager (props) {
  useEffect(() => {
    const { subscribeSocket, socketInitialized, loadAssessments } = props
    const urldata = location.pathname.match(/assessments\/(\d+)/)
    const id = urldata && urldata[1]
    if (!socketInitialized) {
      subscribeSocket('Assessments::Channel', { assessment_id: id })
    }
    loadAssessments(id)
  }, [])

  const { resources, reorderResources } = props
  const onDrag = (list) => {
    reorderResources(list)
  }
  const list = resources.map(r => ({ id: utils.genId(), ...r }))

  return (
    <div className="col-md-12">
      <div className="panel panel-default">
        <Header {...props} />
        <div className={styles.resourceWrapper}>
          {list.map((resource, index) => (
            <DndElement
              key={index}
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
                {...props}
              />
            </DndElement>
          ))}
        </div>
      </div>
      <div className="clearfix" />
    </div>
  )
}
