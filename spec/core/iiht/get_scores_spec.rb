# frozen_string_literal: true

require 'rails_helper'

describe Iiht::GetScores do
  it 'gets user assessment score' do
    iiht_user_assessment = create(:iiht_user_assessment, url: nil)
    user_assessment = iiht_user_assessment.user_assessment
    config = { 'base_api_url' => 'https://tte-iiht.com', 'company_id' => '123' }
    allow_any_instance_of(described_class).to receive(:config).and_return(config)
    allow(Iiht::GetAuthToken).to receive(:call!)
    expected_response = [{ 'id' => 1, 'score' => 1 }]
    stub_request(:get, "#{config['base_api_url']}/getResultsForTestNew").
      with(query: {
        testName: user_assessment.assessment.iiht_assessment_name,
        learnerEmail: user_assessment.user.email,
        companyId: config['company_id']
      }).
      to_return({ body: { 'data' => expected_response }.to_json })
    response = described_class.call!(user_assessment)

    expect(response).to eq(expected_response)
  end
end
