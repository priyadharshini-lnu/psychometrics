# frozen_string_literal: true

require 'rails_helper'

describe Iiht::GetAssessments do
  it 'gets Iiht assessments details' do
    project = create(:project)
    config = { 'tenant_id' => '123' }
    allow(project).to receive(:iiht_config).and_return(config)
    allow(Iiht::GetAuthToken).to receive(:call!)
    expected_response = [{ 'assessmentIdNumber' => 1, 'name' => 'testName', 'description' => 'description1' }]
    stub_request(:get, "#{Settings.iiht.base_api_url}/GetAssessments").
      with(query: {
        tenantId: config['tenant_id']
      }).
      to_return({ body: { 'result' => { 'assessments' => expected_response } }.to_json })
    response = described_class.call!(project)

    expect(response).to eq(expected_response)
  end
end
