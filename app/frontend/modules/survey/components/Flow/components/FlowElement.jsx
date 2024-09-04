import _ from 'lodash'
import { useDispatch } from 'react-redux'
import { actions } from '~/modules/survey/core/builder/flow'
import styles from './Flow.less'
import Views from './types'
import ButtonNew from './ButtonNew'
import Settings from './Settings'

const canAddMore = type => Settings[type].children

const FlowElement = ({
  model: element, index, parent, ...props
}) => {
  const dispatch = useDispatch()

  const addNew = () => {
    if (element.type === 'Randomizer' && element.props.number + 1 === element.elements.length) {
      element.props.number += 1
    }
    dispatch(actions.addNewElement(element))
  }

  const addBelow = () => {
    dispatch(actions.addElementBelow({ element, index }))
  }

  const duplicate = () => {
    dispatch(actions.duplicateElement(element))
  }

  const update = (newModal) => {
    dispatch(actions.updateElement(newModal || element))
  }

  const remove = () => {
    dispatch(actions.removeElement(element))
  }

  const selectType = (type) => {
    dispatch(actions.updateElement({ ...element, type, props: _.cloneDeep(Settings[type].defaults || {}) }))
  }

  const allowAdd = (element) => {
    const settings = Settings[parent.module?.type] || null
    if (!settings || !settings.allowedChildren) { return true }

    return settings.allowedChildren.includes(element)
  }

  const renderFlowType = (model) => {
    const View = Views[model.type]
    return (
      <div>
        <div className={`${styles.element} ${styles[model.type]}`}>
          <View
            {...props}
            model={model}
            onRemove={remove}
            onAddBelow={addBelow}
            onDuplicate={duplicate}
            onUpdate={update}
          />
        </div>
        <div className={styles.row}>
          {canAddMore(model.type) && (
            <div>
              <ButtonNew onClick={addNew} />
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderVariants = () => (
    <div className={styles.elementSelect}>
      <div className={styles.label}>
        What do you want to add?
        <a className="btn" onClick={remove}>Cancel</a>
      </div>
      <div className={styles.btns}>
        {allowAdd('Block') && (
          <button onClick={() => selectType('Block')} className={`btn btn-default ${styles.btn}`}>
            <span className="fa fa-square" />
            Block
          </button>
        )}
        {allowAdd('Group') && (
          <button onClick={() => selectType('Group')} className={`btn btn-default ${styles.btn}`}>
            <span className="fa fa-object-group" />
            Group
          </button>
        )}
        {allowAdd('Branch') && (
          <button onClick={() => selectType('Branch')} className={`btn btn-default ${styles.btn}`}>
            <span className="fa fa-code-fork fa-rotate-90" />
            Branch
          </button>
        )}
        {allowAdd('EmbeddedData') && (
          <button onClick={() => selectType('EmbeddedData')} className={`btn btn-default ${styles.btn}`}>
            <span className="fa fa-database" />
            Embedded Data
          </button>
        )}
        {allowAdd('Randomizer') && (
          <button onClick={() => selectType('Randomizer')} className={`btn btn-default ${styles.btn}`}>
            <span className="fa fa-random" />
            Randomizer
          </button>
        )}
        {allowAdd('EndOfAssessment') && (
          <button onClick={() => selectType('EndOfAssessment')} className={`btn btn-default ${styles.btn}`}>
            <span className="fa fa-exclamation-triangle" />
            End of Assessment
          </button>
        )}
      </div>
    </div>
  )

  return element.type ? renderFlowType(element) : renderVariants(element)
}

export default FlowElement
