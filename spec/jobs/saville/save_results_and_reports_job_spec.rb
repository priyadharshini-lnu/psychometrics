# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Saville::SaveResultsAndReportsJob, type: :job do
  it "doesn't raise exeception if SavilleUserAssessment is not found with particular receipt_id" do
    response = %(
      <AssessmentResult>
        <ReceiptId>
          <IdValue>123</IdValue>
        </ReceiptId>
      </AssessmentResult>
    )

    expect { described_class.new.perform(response) }.to_not raise_exception
  end

  it "doesn't return exception if results are blank" do
    request_id = '123'
    create(:saville_user_assessment, request_id: request_id)
    response = %(
      <AssessmentResult>
        <ReceiptId>
          <IdValue>#{request_id}</IdValue>
        </ReceiptId>
      </AssessmentResult>
    )

    expect { described_class.new.perform(response) }.to_not raise_exception
  end

  it 'saves pdf to user report' do
    request_id = '123'
    saville_user_assessment = create(:saville_user_assessment, request_id: request_id)
    user_assessment = saville_user_assessment.user_assessment
    report = create(:report, :saville, assessments: [user_assessment.assessment])
    user_report = create(:user_report, report: report, campaign_id: user_assessment.campaign_id,
      user_id: user_assessment.subject_id, pdf: nil, status: :not_prepared)

    response = %(
      <AssessmentResult>
        <ReceiptId>
          <IdValue>#{request_id}</IdValue>
        </ReceiptId>
        <Results>
          <SupportingMaterials>
            <Id><IdValue>#{report.saville_report_id}</IdValue></Id>
            <EmbeddedData>
              <EncodedContent>#{file_fixture('base64pdf.txt').read}</EncodedContent>
            </EmbeddedData>
          </SupportingMaterials>
        </Results>
      </AssessmentResult>
    )

    described_class.new.perform(response)
    user_report.reload
    expect(user_report.status).to eq('prepared')
    expect(user_report.pdf?).to eq(true)
  end
end
