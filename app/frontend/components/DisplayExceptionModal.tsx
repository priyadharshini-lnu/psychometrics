import {
  Button, Modal, Typography,
} from 'antd'
import { useExceptionStore } from '~/core/exception'
import array from '~/utils/array'
import { isLiveEnvironment } from '~/utils/isLiveEnvironment'

const { Title } = Typography

export const DisplayExceptionModal = () => {
  const { exception, setException } = useExceptionStore()

  if (isLiveEnvironment() || !exception) return null

  const getErrors = () => {
    if (exception.type === 'PankoOverride::Exceptions::SchemaValidationFailed') {
      return (
        <>
          <div>
            <Title level={5}>Schema name:</Title>
            <pre>{exception.meta.schema}</pre>
          </div>
          <div>
            <Title level={5}>Errors:</Title>
            <pre>{JSON.stringify(exception.meta.errors, null, 2)}</pre>
          </div>

          <div>
            <Title level={5}>Response:</Title>
            <pre>{JSON.stringify(exception.meta.response, null, 2)}</pre>
          </div>
        </>
      )
    }

    return array.joinJSXElements(exception.message.split('\n'), <br />)
  }

  return (
    <Modal
      title={`Exception: ${exception.type}`}
      width={700}
      open
      onCancel={() => setException(null)}
      footer={[
        <Button key="close" onClick={() => setException(null)}>
          Cancel
        </Button>,
      ]}
    >
      {getErrors()}
    </Modal>
  )
}
