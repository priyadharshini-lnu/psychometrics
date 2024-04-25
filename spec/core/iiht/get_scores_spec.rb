# frozen_string_literal: true

require 'rails_helper'

describe Iiht::GetScores do
  it 'gets user assessment score' do
    iiht_user_assessment = create(:iiht_user_assessment, url: nil, email: 'some_email@cc.com')
    user_assessment = iiht_user_assessment.user_assessment
    config = { 'tenant_id' => '123' }
    allow_any_instance_of(described_class).to receive(:config).and_return(config)
    allow(Iiht::GetAuthToken).to receive(:call!)
    expected_response = { 'isSuccess' => true, 'attempts' => [{ 'number' => 1, 'score' => 1 }] }
    stub_request(:get, "#{Settings.iiht.base_api_url}/GetUserAssessmentResult").
      with(query: {
        assessmentIdNumber: user_assessment.assessment.external_settings[:assessment_id],
        userEmailAddress: iiht_user_assessment.email,
        tenantId: config['tenant_id']
      }).
      to_return({ body: { 'result' => expected_response }.to_json })
    response = described_class.call!(user_assessment)

    expect(response).to eq(expected_response)
  end
end
