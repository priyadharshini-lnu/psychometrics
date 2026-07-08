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
      'kid' => key_id,
      'tg' => 'cmp',
      'tg_cmp_id' => campaign.id.to_s
    }.merge(payload_overrides)

    JWT.encode(payload, rsa_private_key, 'RS256', { kid: key_id })
  end

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

    it 'returns invalid_application_or_key when campaign project tenant differs from signing application tenant' do
      other_project = create(:project)
      other_campaign = create(:campaign, project: other_project, status: :active)
      other_participant = create(:user, project: other_project)
      create(:campaign_user, campaign: other_campaign, user: other_participant, active: true)

      payload_overrides['sub'] = other_participant.id.to_s
      payload_overrides['tg_cmp_id'] = other_campaign.id.to_s

      expect(call_service[:error]).to eq(:invalid_application_or_key)
    end

    it 'returns replay with substituted return_url when a single use token is replayed' do
      payload_overrides['single_use'] = true
      payload_overrides['ret_url'] = "https://#{project.subdomain}.#{Settings.domain}/done?status=ASSESSMENT_STATUS"
      allow(Jwt::SingleUse::SingleUseJtiGuard).to receive(:call).and_return({ replayed: { reason: :replayed } })

      expect(call_service[:token_reuse_detected]).to eq(
        return_url: "https://#{project.subdomain}.#{Settings.domain}/done?status=campaign_pending"
      )
    end
  end
end
