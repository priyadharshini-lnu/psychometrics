import Types from './Types'

const ThreeSixtyDefault = ({
  model, insertPaginationPage, preview, aiTranslation,
}) => {
  const Type = Types[model.props.sourceType]
  return (
    <div>
      <Type
        model={model}
        insertPaginationPage={insertPaginationPage}
        preview={preview}
        aiTranslation={aiTranslation}
      />
    </div>
  )
}
export default ThreeSixtyDefault
