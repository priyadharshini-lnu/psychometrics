# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Jwt::Sso::ResolveBearerToken do
  subject(:call_service) { described_class.call(token: token) }

  let(:project) { create(:project) }
  let(:participant) { create(:user, project: project) }
  let(:campaign) { create(:campaign, project: project, status: :active) }
  let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: participant, active: true) }
  let(:application_user) { create(:application_user, tenant: project.client) }
  let(:rsa_private_key) { OpenSSL::PKey::RSA.generate(2048) }
  let(:key_id) { SecureRandom.random_number(ApplicationPublicKey::MIN_KEY_ID..ApplicationPublicKey::MAX_KEY_ID) }
  let!(:public_key) do
    create(
      :application_public_key,
      user: application_user,
      key_id: key_id,
      public_key: rsa_private_key.public_key.to_pem,
      disabled: false
    )
  end
  let(:token_audience) { Jwt::BuildAudience.call!(application: application_user) }
  let(:payload_overrides) { {} }
  let(:token) do
    payload = {
      'iss' => application_user.id.to_s,
      'jti' => SecureRandom.uuid,
      'aud' => token_audience,
      'exp' => 15.minutes.from_now.to_i,
      'sub' => participant.id.to_s,
      'tg' => 'cmp',
      'tg_cmp_id' => campaign.id.to_s
    }.merge(payload_overrides)

    JWT.encode(payload, rsa_private_key, 'RS256', { kid: key_id })
  end

  before { Current.project = project }

  describe '.call' do
    it 'authenticates a valid token and returns target details' do
      result = call_service

      expect(result[:ok]).to include(
        participant: participant,
        target_type: 'cmp',
        campaign_id: campaign.id,
        user_assessment_id: nil
      )
    end

    it 'authenticates a valid token without target details for dashboard redirect' do
      payload_overrides['tg'] = nil
      payload_overrides['tg_cmp_id'] = nil

      expect(call_service[:ok]).to include(
        participant: participant,
        target_type: nil,
        campaign_id: nil,
        user_assessment_id: nil
      )
    end

    it 'returns invalid_claims when return_url is present without target' do
      payload_overrides['tg'] = nil
      payload_overrides['ret_url'] = 'https://example.com/done'

      expect(call_service[:error]).to eq(:invalid_claims)
    end

    it 'returns invalid_claims when ret_url is present with a campaign from a different tenant' do
      other_project = create(:project)
      other_campaign = create(:campaign, project: other_project, status: :active)

      payload_overrides['tg_cmp_id'] = other_campaign.id.to_s
      payload_overrides['ret_url'] = 'https://example.com/done'

      expect(call_service[:error]).to eq(:invalid_claims)
    end

    it 'returns replay with substituted return_url when a single use token is replayed' do
      payload_overrides['single_use'] = true
      payload_overrides['ret_url'] = 'https://example.com/done?status=ASSESSMENT_STATUS'
      allow(Jwt::SingleUse::SingleUseJtiGuard).to receive(:call).and_return({ replayed: { reason: :replayed } })

      expect(call_service[:token_reuse_detected]).to eq(
        return_url: 'https://example.com/done?status=campaign_pending',
        application: application_user
      )
    end
  end
end
