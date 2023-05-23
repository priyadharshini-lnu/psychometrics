import Types from './Types'

const ThreeSixtyDefault = ({ model }) => {
  const Type = Types[model.props.sourceType]
  return (
    <div>
      <Type model={model} />
    </div>
  )
}
export default ThreeSixtyDefault
