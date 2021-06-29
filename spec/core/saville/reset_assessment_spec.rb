# frozen_string_literal: true

require 'rails_helper'

describe Saville::ResetAssessment do
  before(:all) { savon.mock!   }
  after(:all)  { savon.unmock! }

  it 'makes assessment cancel request' do
    request_id = 123
    saville_user_assessment = create(:saville_user_assessment, request_id: request_id)
    xml = saville_assessment_cancel_request(request_id)
    savon.expects(:process_assessment_cancel_request).with(message: { xml: xml.squish }).
      returns(build_saml_response(:process_assessment_cancel_request))

    described_class.call!(saville_user_assessment.user_assessment)
  end

  def saville_assessment_cancel_request(request_id)
    %(
      <AssessmentCancelRequest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://ns.hr-xml.org/2007-04-15 http://ns.hr-xml.org/2_5/HR-XML-2_5/StandAlone/AssessmentCancelRequest.xsd"
        xmlns="http://ns.hr-xml.org/2007-04-15">
        <ClientId idOwner="Saville Consulting">
          <IdValue name="ClientCode">saville_client_code</IdValue>
        </ClientId>
        <ProviderId idOwner="The Talent Enterprise">
          <IdValue>Saville Assessment</IdValue>
        </ProviderId>
        <ClientOrderId>
          <IdValue name=""></IdValue>
        </ClientOrderId>
        <ReceiptId idOwner="Saville Assessment">
          <IdValue>#{request_id}</IdValue>
        </ReceiptId>
      </AssessmentCancelRequest>
    )
  end
end
