import Types from './Types'

const ThreeSixtyDefault = ({ model, insertPaginationPage }) => {
  const Type = Types[model.props.sourceType]
  return (
    <div>
      <Type model={model} insertPaginationPage={insertPaginationPage} />
    </div>
  )
}
export default ThreeSixtyDefault
