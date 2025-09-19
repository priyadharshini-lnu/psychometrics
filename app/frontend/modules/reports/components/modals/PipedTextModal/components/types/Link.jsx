/* eslint-disable jsx-a11y/interactive-supports-focus */
const Link = ({ field, insert, context }) => (
  <div
    style={{ marginBottom: 1 }}
    role="button"
    onClick={() => insert(field.value || (typeof field.getValue === 'function' && field.getValue(context)))}
  >
    <a>{field.name}</a>
  </div>
)

export default Link
