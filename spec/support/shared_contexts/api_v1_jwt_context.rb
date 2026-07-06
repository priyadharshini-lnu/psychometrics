# frozen_string_literal: true

RSpec.shared_context 'api v1 jwt setup' do
  let(:tenant) { create(:tenancy) }
  let(:application_user) { create(:application_user, tenant: tenant) }
  let(:private_key) { OpenSSL::PKey::RSA.generate(2048) }
  let(:now) { Time.current.to_i }

  let!(:public_key) do
    create(
      :application_public_key,
      user: application_user,
      tenant_id: application_user.tenant_id,
      public_key: private_key.public_key.to_pem,
      created_by_id: application_user.id,
      disabled: false
    )
  end

  let(:token_aud) { 'http://testdev.com' }
  let(:expected_aud) { token_aud }

  let(:headers) do
    {
      kid: public_key.key_id,
      typ: 'JWT',
      alg: 'RS256'
    }
  end

  let(:payload) do
    {
      iss: application_user.id,
      jti: SecureRandom.uuid,
      aud: token_aud,
      exp: now + 300,
      single_use: false
    }
  end

  let(:token) { JWT.encode(payload, private_key, 'RS256', headers) }
end
