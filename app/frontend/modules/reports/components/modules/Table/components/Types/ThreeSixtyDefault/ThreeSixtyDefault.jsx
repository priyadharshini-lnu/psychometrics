import Types from './Types'

const ThreeSixtyDefault = ({ model, insertPaginationPage, preview }) => {
  const Type = Types[model.props.sourceType]
  return (
    <div>
      <Type model={model} insertPaginationPage={insertPaginationPage} preview={preview} />
    </div>
  )
}
export default ThreeSixtyDefault
