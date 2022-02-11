# frozen_string_literal: true

require 'rails_helper'

describe Iiht::GetAssessments do
  it 'gets Iiht assessments details' do
    project = create(:project)
    config = { 'base_api_url' => 'https://tte-iiht.com', 'company_id' => '123' }
    allow(project).to receive(:iiht_config).and_return(config)
    allow(Iiht::GetAuthToken).to receive(:call!)
    expected_response = [{ 'id' => 1, 'testName' => 'testName' }]
    stub_request(:get, "#{config['base_api_url']}/testlistContent").
      with(query: {
        companyId: config['company_id']
      }).
      to_return({ body: { 'data' => { 'tests' => expected_response } }.to_json })
    response = described_class.call!(project)

    expect(response).to eq(expected_response)
  end
end
