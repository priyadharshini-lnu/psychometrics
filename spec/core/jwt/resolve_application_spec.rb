# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Jwt::ResolveApplication do
  include_context 'api v1 jwt setup'

  subject(:call_service) { described_class.call(token: token) }

  describe '.call' do
    it 'returns application for valid issuer and matching key' do
      result = call_service

      expect(result[:ok]).to eq(application_user)
    end

    it 'returns invalid_issuer when issuer does not match application resolved from key' do
      other_application = create(:application_user, tenant: tenant)
      other_key = create(
        :application_public_key,
        user: other_application,
        tenant_id: other_application.tenant_id,
        public_key: OpenSSL::PKey::RSA.generate(2048).public_key.to_pem,
        created_by_id: other_application.id,
        disabled: false
      )

      mismatched_token = JWT.encode(payload, private_key, 'RS256', headers.merge(kid: other_key.key_id))
      result = described_class.call(token: mismatched_token)

      expect(result[:error]).to eq(:invalid_issuer)
    end

    it 'returns invalid_key_id for non-numeric kid' do
      invalid_token = JWT.encode(payload, private_key, 'RS256', headers.merge(kid: 'invalid-kid'))
      result = described_class.call(token: invalid_token)

      expect(result[:error]).to eq(:invalid_key_id)
    end
  end
end
