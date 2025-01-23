# frozen_string_literal: true

require 'rails_helper'

describe Saville::AssessmentOrderRequest do
  include Rails.application.routes.url_helpers

  before(:all) { savon.mock!   }
  after(:all)  { savon.unmock! }

  let(:assessment) { create(:assessment, :saville, external_settings: { norm_id: 'norm_id' }) }
  let(:report) { create(:report, :saville, assessments: [assessment]) }
  let(:user_assessment) { create(:user_assessment, assessment: assessment) }
  let(:saville_user_assessment) do
    create(
      :saville_user_assessment,
      user_assessment: user_assessment,
      norm_id: 'norm_id', data_seprator: '12-13', candidate_id: user_assessment.subject_id
    )
  end
  let(:user) { user_assessment.subject }
  let(:campaign) { user_assessment.campaign }
  let!(:user_report) { create(:user_report, report: report, user: user, campaign: campaign) }
  let(:saville_assessment_url) { 'https://saville.cc.com/assessment_id' }
  let(:saville_receipt_id) { 'receipt_id' }

  it 'saves saville assessment url and receipt id' do
    savon.expects(:process_assessment_order_request).with(message: { xml: saville_assessment_order_request.squish }).
      returns(saville_assessment_order_response)

    described_class.call!(user_assessment)

    expect(saville_user_assessment.request_id).to eq(saville_receipt_id)
    expect(saville_user_assessment.url).to eq(saville_assessment_url)
  end

  def saville_assessment_order_response
    build_saml_response(:process_assessment_order_request, %(
      <AssessmentOrderAcknowledgement>
        <AccessPoint>
          <InternetWebAddress>#{saville_assessment_url}</InternetWebAddress>
        </AccessPoint>
        <ReceiptId>
          <IdValue>#{saville_receipt_id}</IdValue>
        </ReceiptId>
      </AssessmentOrderAcknowledgement>
    ))
  end

  def saville_assessment_order_request
    saville_redirect_url = redirect_saville_user_assessment_url(user_assessment.id, {
      host: Settings.domain,
      subdomain: user_assessment.project.subdomain,
      protocol: Settings.protocol,
      port: Settings.port
    })
    webhook_url = webhooks_saville_url(
      host: Settings.domain,
      subdomain: Settings.subdomain,
      protocol: Settings.protocol,
      port: Settings.port
    )
    # rubocop:disable Layout/LineLength
    %(
      <AssessmentOrderRequest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://ns.hr-xml.org/2007-04-15 ../HRXML200704/HR-XML-2_5/StandAlone/AssessmentOrderRequest.xsd"
        xmlns="http://ns.hr-xml.org/2007-04-15">
        <ClientId idOwner="Saville Consulting">
          <IdValue name="ClientCode">saville_client_code</IdValue>
        </ClientId>
        <PackageId idOwner="Saville Consulting">
          <IdValue name="Instrument">#{assessment.external_settings[:assessment_id]}</IdValue>
          <IdValue name="XmlScores">#{report.external_settings[:report_id]}</IdValue>
          <IdValue name="PdfReport">#{report.external_settings[:report_id]}</IdValue>
        </PackageId>
        <ProviderId idOwner="The Talent Enterprise">
          <IdValue>Saville Consulting</IdValue>
        </ProviderId>
        <ComparisonGroupId>
          <IdValue name="">#{saville_user_assessment.norm_id}</IdValue>
        </ComparisonGroupId>
        <ClientOrderId>
          <IdValue name="Company">#{saville_user_assessment.data_seprator}</IdValue>
          <IdValue name="AssessmentPushbackUrl">#{webhook_url}</IdValue>
          <IdValue name="AssessmentCompleteReturnUrl">#{saville_redirect_url}</IdValue>
        </ClientOrderId>
        <AssessmentRequester>#{user.decorate.full_name}</AssessmentRequester>
        <AssessmentSubject>
          <SubjectId idOwner="Campaign">
            <IdValue name="CandidateID">#{user.id}</IdValue>
          </SubjectId>
          <PersonName>
            <LegalName>#{user.decorate.last_name}</LegalName>
            <GivenName>#{user.decorate.first_name}</GivenName>
          </PersonName>
          <ContactMethod>
            <InternetEmailAddress>#{user.decorate.email}</InternetEmailAddress>
          </ContactMethod>
        </AssessmentSubject>
        <AssessmentLanguage>en-GB</AssessmentLanguage>
        <ResultLanguage>en-GB</ResultLanguage>
      </AssessmentOrderRequest>
    )
    # rubocop:enable Layout/LineLength
  end
end
