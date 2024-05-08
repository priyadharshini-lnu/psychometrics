# frozen_string_literal: true

require 'rails_helper'

describe PowerBi::GetEmbedToken do
  let(:dataset_id) { 'pb_dataset_id' }
  let(:report_id) { 'pb_report_id' }
  let(:access_token) { 'pb_access_token' }
  let(:embed_token) { 'pb_embed_token' }

  it do
    config = Settings.secrets.power_bi
    identities = { username: Faker::Internet.email }
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
    stub_request(:post, 'https://api.powerbi.com/v1.0/myorg/GenerateToken').
      with(body: {
             reports: [{ id: report_id }],
             datasets: [{ id: dataset_id }],
             identities: [
               {
                 roles: ['Self'],
                 datasets: [dataset_id]
               }.merge(identities)
             ]
           },
           headers: {
             Authorization: "Bearer #{access_token}",
             'Content-Type': 'application/json'
           }).
      to_return({
        body: { 'token' => embed_token }.to_json
      })

    result = described_class.call!(dataset_id, report_id, identities)
    expect(result).to eq(embed_token)
  end
end
