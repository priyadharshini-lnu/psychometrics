# frozen_string_literal: true

require 'rails_helper'

describe OracleAnalytics::GetEmbedToken do
  let(:client_id) { Faker::Lorem.sentence }
  let(:client_secret) { Faker::Lorem.sentence }
  let(:private_key) { OpenSSL::PKey::RSA.generate(1024) }
  let(:secrets) { { client_id: client_id, client_secret: client_secret } }
  let(:basic_auth_token) { Base64.strict_encode64("#{secrets[:client_id]}:#{secrets[:client_secret]}") }
  let(:config) { Settings.oac }
  let(:oac_returned_token) { Faker::Lorem.sentence }

  before(:each) do
    expect(Settings).to receive_message_chain(:secrets, :oac).and_return(secrets)
    allow_any_instance_of(described_class).to receive(:private_key).and_return(private_key)
  end

  it 'gets embed token for client_admin' do
    client_admin = create(:client_admin)
    stub_request(:post, "#{config[:base_api_url]}/oauth2/v1/token").
      with(
        headers: { Authorization: "basic #{basic_auth_token}" },
        body: {
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          assertion: oac_jwt(client_admin.email),
          scope: config[:oauth_scope_for_embedding]
        }
      ).to_return({ body: { access_token: oac_returned_token }.to_json })

    result = described_class.call!(client_admin)
    expect(result).to eq(oac_returned_token)
  end

  it 'gets embed token for superadmin' do
    superadmin = create(:superadmin)
    stub_request(:post, "#{config[:base_api_url]}/oauth2/v1/token").
      with(
        headers: { Authorization: "basic #{basic_auth_token}" },
        body: {
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          assertion: oac_jwt(config[:all_workbook_access_user_email]),
          scope: config[:oauth_scope_for_embedding]
        }
      ).to_return({ body: { access_token: oac_returned_token }.to_json })

    result = described_class.call!(superadmin)
    expect(result).to eq(oac_returned_token)
  end

  it 'returns error if request failed' do
    superadmin = create(:superadmin)
    error_response = { 'msg' => 'Something went wrong' }
    stub_request(:post, "#{config[:base_api_url]}/oauth2/v1/token").
      to_return({ status: 404, body: error_response.to_json })

    result = described_class.call(superadmin)
    expect(result[:error]).to eq(error_response)
  end

  def oac_jwt(email)
    JWT.encode(
      {
        exp: 8.hours.from_now.to_i,
        sub: email,
        aud: 'https://identity.oraclecloud.com/',
        iss: secrets[:client_id],
        'oracle.oauth.sub.id_type': 'LDAP_UID',
        prn: email,
        jti: secrets[:client_id],
        iat: Time.now.to_i,
        'oracle.oauth.prn.id_type': 'LDAP_UID'
      },
      private_key,
      'RS256',
      {
        alg: 'RS256',
        typ: 'JWT',
        kid: 'RSACert'
      }
    )
  end
end
