# frozen_string_literal: true

require 'rails_helper'

describe PowerBi::RefreshDataset do
  let(:dataset_id) { 'pb_dataset_id' }
  let(:access_token) { 'pb_access_token' }
  let(:config) { Settings.secrets.power_bi }
  before do
    stub_request(:post, "https://login.microsoftonline.com/#{config[:tenant_id]}/oauth2/token").
      with(body: {
        grant_type: 'client_credentials',
        client_id: config[:client_id],
        client_secret: config[:client_secret],
        resource: 'https://analysis.windows.net/powerbi/api'
      }).
      to_return({
        body: { 'access_token' => access_token }.to_json
      })
  end

  it do
    stub_request(
      :post,
      "#{described_class::BASE_API_URL}/groups/#{config[:tenant_id]}/datasets/#{dataset_id}/refreshes"
    ).
      with(
        headers: {
          Authorization: "Bearer #{access_token}",
          'Content-Type': 'application/json'
        }
      )

    described_class.call!(dataset_id)
  end

  it 'raise  PowerBi::RefreshFailedError exception if powerbi returns error ' do
    stub_request(
      :post,
      "#{described_class::BASE_API_URL}/groups/#{config[:tenant_id]}/datasets/#{dataset_id}/refreshes"
    ).and_return(
      status: 400,
      body: {
        'error' => { 'message' => 'Invalid request' }
      }.to_json
    )

    expect do
      described_class.call!(dataset_id)
    end.to raise_exception(PowerBi::RefreshFailedError, 'Invalid request')
  end
end
