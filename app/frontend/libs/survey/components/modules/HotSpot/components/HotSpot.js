import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Raphael from 'raphael'
import TextEditor from 'components/TextEditor'
import ShapeEditor from './ShapeEditor/ShapeEditor'
import styles from './HotSpot.scss'

export class HotSpot extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  state = {
    shapeEditor: {},
    selectedShape: false,
    selectedPoint: false,
    editMode: false,
  }

  componentDidMount () {
    const { model } = this.props

    this.paper = new Raphael(this.raphaelPaper, 700, 500)

    const shapeEditor = new ShapeEditor(this.paper, {
      onChange: this.onChange,
      onSelectShape: this.selectShape,
      onDeselectShape: this.deselectShape,
      onCloseEditMode: this.closeEditMode,
      onSelectPoint: this.selectPoint,
      onDeselectPoint: this.deselectPoint,
    })

    if (model.props.regions) {
      (model.props.regions).forEach((shape) => {
        shapeEditor.createShape(shape)
      })
    }

    this.setState({ shapeEditor })
  }


  changeText = (value) => {
    const { model } = this.props
    model.changeProps({ questionText: value })
    this.forceUpdate()
  }

  clickPaper = () => {
    // this.state.shapeEditor.deselectAll()
  }

  onChange = (data) => {
    const { model } = this.props
    model.props.regions = data
    model.update()
  }

  selectShape = (shapeIndex) => {
    const { select } = this.props
    select(shapeIndex)
    this.setState({ selectedShape: true })
  }

  deselectShape = () => {
    this.setState({ selectedShape: false, editMode: false })
  }

  addShape = () => {
    const { shapeEditor } = this.state
    const { model } = this.props
    shapeEditor.addShape()
    const i = model.props.regions.length
    model.changeArrayProps({
      collection: 'regionsNames',
      i: (i - 1),
      val: model.moduleConfig.defaultChoiceText(i),
    })
  }

  cloneShape = () => {
    const { shapeEditor } = this.state
    shapeEditor.cloneShape()
  }

  // Turn edit mode
  editShape = () => {
    const { shapeEditor } = this.state
    shapeEditor.editShape()
    this.setState({ editMode: true })
  }

  closeEditMode = () => {
    this.setState({ editMode: false, selectedPoint: false })
  }

  selectPoint = () => {
    this.setState({ selectedPoint: true })
  }

  deselectPoint = () => {
    this.setState({ selectedPoint: false })
  }

  addPoint = () => {
    const { shapeEditor } = this.state
    shapeEditor.addPoint()
  }

  removePoint = () => {
    const { shapeEditor } = this.state
    shapeEditor.removePoint()
  }

  removeShape = () => {
    const { model, shapeIndex } = this.props
    const { shapeEditor } = this.state
    const { regionsNames } = model.props
    regionsNames.splice(shapeIndex, 1)
    model.changeProps({ regionsNames })
    shapeEditor.removeShape()
  }

  onGraphicLoaded = () => {
    // Plus 30 px because all shapes have resizer border, which eat 15px from both side
    this.paper.setSize(this.graphic.width + 30, this.graphic.height + 30)
  }

  renderGraphic () {
    const { model } = this.props
    if (model.props.graphicUrl !== false) {
      return (
        <img
          className={styles.graphic}
          src={model.props.graphicUrl}
          ref={(ref) => { this.graphic = ref }}
          onLoad={this.onGraphicLoaded}
        />
      )
    }
  }

  render () {
    const { editMode, selectedShape, selectedPoint } = this.state
    const disabledCloneButton = (editMode || !selectedShape) && !editMode
    const disabledEditButton = (editMode || !selectedShape) && !editMode
    const disabledAddPointButton = !editMode
    const disabledRemovePointButton = !selectedPoint
    const disabledRemoveButton = !selectedShape
    const { model } = this.props
    return (
      <div>
        <TextEditor model={model} value={model.props.questionText} onChange={this.changeText} />
        <div className={`${styles.graphicPanel} panel panel-default`}>
          <div className="panel-body panel-body-search">
            <div className={styles.buttons}>
              <button onClick={this.addShape} type="button" className="btn btn-primary">Add Shape</button>
              <button
                onClick={this.cloneShape}
                type="button"
                disabled={disabledCloneButton}
                className="btn btn-primary"
              >
                Clone Shape
              </button>
              <button
                onClick={this.editShape}
                type="button"
                disabled={disabledEditButton}
                className="btn btn-primary"
              >
                Edit Shape
              </button>
              <button
                onClick={this.addPoint}
                type="button"
                disabled={disabledAddPointButton}
                className="btn btn-primary"
              >
                Add Point
              </button>
              <button
                onClick={this.removePoint}
                type="button"
                disabled={disabledRemovePointButton}
                className="btn btn-primary"
              >
              Remove Point
              </button>
              <button
                onClick={this.removeShape}
                type="button"
                disabled={disabledRemoveButton}
                className="btn btn-danger pull-right"
              >
              Remove Shape
              </button>
            </div>
          </div>
        </div>
        <div onClick={this.clickPaper} ref={(ref) => { this.raphaelPaper = ref }} className={styles.graphicWrap}>
          {this.renderGraphic()}
        </div>
      </div>
    )
  }
}

export default HotSpot
