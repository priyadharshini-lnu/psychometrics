import { Typography, Col, Row } from 'antd'
import { BookingConfirmationContainer } from '~/glint'

const { Title, Text } = Typography

export const Confirmation = () => {
  const headerContent = (
    <>
      <Title level={4}>Confirm this booking?</Title>
      Please confirm that these details are correct before finalizing the booking.
    </>
  )
  const detailsContent = (
    <>
      <Row>
        <Col span={4}><Text type="secondary">What</Text></Col>
        <Col>Title of the invite will come here</Col>
      </Row>
    </>

  )
  const footerContent = 'Footer'
  return (
    <BookingConfirmationContainer
      headerContent={headerContent}
      detailsContent={detailsContent}
      footerContent={footerContent}
    />
  )
}
