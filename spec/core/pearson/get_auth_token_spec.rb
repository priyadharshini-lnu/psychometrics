# frozen_string_literal: true

require 'rails_helper'

describe Pearson::GetAuthToken do
  it 'gets auth token' do
    config = Settings.secrets.pearson
    credentials = Settings.secrets.pearson[:credentials]
    stub_request(:post, "#{config[:base_api_url]}/v1/authentication/token").
      with(body: { 'username' => credentials[:user_name], 'password' => credentials[:password] }).
      to_return({ body: { 'data' => { 'accessToken' => 'access_token' } }.to_json })
    response = described_class.call!

    expect(response).to eq('access_token')
  end
end
