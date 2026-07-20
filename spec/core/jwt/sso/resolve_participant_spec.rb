# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Jwt::Sso::ResolveParticipant do
  subject(:call_service) { described_class.call(subject: subject_value, campaign_id: campaign_id) }

  let(:project) { create(:project) }
  let(:campaign) { create(:campaign, project: project, status: :active) }
  let(:campaign_id) { campaign.id }
  let(:participant) { create(:user, project: project) }
  let(:subject_value) { participant.id.to_s }

  describe '.call' do
    it 'returns the participant for a valid subject and campaign' do
      result = call_service

      expect(result[:ok]).to eq(participant)
    end

    it 'returns participant_not_found when subject is blank' do
      expect(described_class.call(subject: nil, campaign_id: campaign_id)[:error]).to eq(:participant_not_found)
    end

    it 'returns participant_not_found when campaign does not exist' do
      expect(described_class.call(subject: subject_value, campaign_id: -1)[:error]).to eq(:participant_not_found)
    end

    it 'returns participant_disabled when participant is disabled' do
      participant.update!(disabled: true)

      expect(call_service[:error]).to eq(:participant_disabled)
    end

    it 'returns the participant when subject is an email address' do
      result = described_class.call(subject: participant.email, campaign_id: campaign_id)

      expect(result[:ok]).to eq(participant)
    end

    it 'returns participant_not_found when email belongs to another project' do
      other_project = create(:project)
      other_user = create(:user, project: other_project)

      result = described_class.call(subject: other_user.email, campaign_id: campaign_id)

      expect(result[:error]).to eq(:participant_not_found)
    end
  end
end
