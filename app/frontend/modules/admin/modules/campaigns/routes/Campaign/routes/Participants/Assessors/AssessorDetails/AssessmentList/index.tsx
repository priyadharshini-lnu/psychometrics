import React from 'react'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import {
  Row, Col,
} from 'antd'
import { connect, ConnectedProps } from 'react-redux'

const connecter = connect(
  () => ({
  }),
  {

  },
)

type Props = RouteComponentProps & ConnectedProps<typeof connecter>

const AssessmentList: React.FC<RouteComponentProps & Props> = () => (
  <Row>
    <Col span={24}>
      Not implemented yet
    </Col>
  </Row>
)

export default connecter(withRouter(AssessmentList))
