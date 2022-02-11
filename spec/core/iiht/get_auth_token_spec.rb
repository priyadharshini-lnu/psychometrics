# frozen_string_literal: true

require 'rails_helper'

describe Iiht::GetAuthToken do
  it 'gets Iiht assessments details' do
    project = create(:project)
    config = { 'base_api_url' => 'https://tte-iiht.com', 'company_id' => '123' }
    allow(project).to receive(:iiht_config).and_return(config)
    expected_token = 'token'
    stub_request(:post, "#{config['base_api_url']}/authenticate").
      with(body: { companyId: config['company_id'] }.to_json).
      to_return({ body: { 'token' => expected_token }.to_json })
    response = described_class.call!(project)

    expect(response).to eq(expected_token)
  end
end
