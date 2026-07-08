# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Jwt::Sso::ResolveTargetRoute do
  subject(:call_service) do
    described_class.call(
      target_type: target_type,
      campaign_id: campaign.id,
      assessment_id: assessment_id,
      participant: participant
    )
  end

  let(:project) { create(:project) }
  let(:campaign) { create(:campaign, project: project, status: :active) }
  let(:participant) { create(:user, project: project) }
  let(:assessment_id) { nil }

  before do
    create(:campaign_user, campaign: campaign, user: participant, active: true)
  end

  describe '.call' do
    context 'when target is cmp' do
      let(:target_type) { 'cmp' }

      it 'returns the campaign target details' do
        result = call_service

        expect(result[:ok]).to eq(
          target_type: 'cmp',
          campaign_id: campaign.id,
          replay_status: 'campaign_pending'
        )
      end
    end

    context 'when target is asmt' do
      let(:target_type) { 'asmt' }
      let(:user_assessment) do
        create(:user_assessment, campaign: campaign, evaluator: participant, subject: participant)
      end
      let(:assessment_id) { user_assessment.id }

      it 'returns the assessment target details' do
        result = call_service

        expect(result[:ok]).to eq(
          target_type: 'asmt',
          campaign_id: campaign.id,
          user_assessment_id: user_assessment.id,
          replay_status: 'assessment_pending'
        )
      end
    end

    it 'returns campaign_not_eligible when participant is not active in the campaign' do
      CampaignUser.find_by(campaign: campaign, user: participant)&.update!(active: false)

      result = described_class.call(
        target_type: 'cmp',
        campaign_id: campaign.id,
        assessment_id: nil,
        participant: participant
      )

      expect(result[:error]).to eq(:campaign_not_eligible)
    end

    it 'returns assessment_not_found for missing assessment target' do
      result = described_class.call(
        target_type: 'asmt',
        campaign_id: campaign.id,
        assessment_id: -1,
        participant: participant
      )

      expect(result[:error]).to eq(:assessment_not_found)
    end
  end
end
