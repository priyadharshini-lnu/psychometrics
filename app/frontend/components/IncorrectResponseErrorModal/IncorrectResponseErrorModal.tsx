import React from 'react'
import { Modal, Button } from 'antd'
import _ from 'lodash'
import { PropsFromRedux } from './connect'
import styles from './styles.less'

type Props = PropsFromRedux

const IncorrectResponseErrorModal: React.FC<Props> = ({
  requestName, errors, data, clearResponseDataMismatched,
}) => (
  <Modal
    zIndex={10000000}
    width={850}
    title="Response data mismatched"
    open={!_.isEmpty(errors)}
    onCancel={clearResponseDataMismatched}
    footer={[
      <Button key="cancel" onClick={clearResponseDataMismatched}>
        Cancel
      </Button>,
    ]}
  >
    <div>
      <b>Request Name:</b>
      {' '}
      {requestName}
    </div>
    <div>
      <b>Errors:</b>
      <pre className={styles.codeDisplay}>{JSON.stringify(errors, null, 2)}</pre>
    </div>

    <div>
      <b>Data from response:</b>
      <pre className={styles.codeDisplay}>{JSON.stringify(data, null, 2)}</pre>
    </div>
  </Modal>
)


export default IncorrectResponseErrorModal
