# frozen_string_literal: true

require 'rails_helper'

describe Iiht::GetAuthToken do
  it 'gets Iiht assessments details' do
    project = create(:project)
    config = { 'user' => 'user@cc.com', 'password' => 'password', 'tenancy_name' => 'tenancyName' }
    allow(project).to receive(:iiht_config).and_return(config)
    expected_token = 'token'
    stub_request(:post, Settings.iiht.token_api_url).
      with(body: {
        userNameOrEmailAddress: config['user'],
        password: config['password'],
        tenancyName: config['tenancy_name']
      }.to_json).
      to_return({ body: { 'accessToken' => expected_token }.to_json })
    response = described_class.call!(project)

    expect(response).to eq(expected_token)
  end
end
