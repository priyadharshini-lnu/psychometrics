import EmailEditor from '~/components/EmailEditor'

export default function Form ({ elementId }) {
  const el = document.getElementById(elementId)

  const onChange = (value) => {
    const el = document.getElementById(elementId)
    el.value = value
  }

  return (
    <div className="ant-form-vertical">
      <EmailEditor handleContentChange={onChange} content={el.value} />
    </div>
  )
}
