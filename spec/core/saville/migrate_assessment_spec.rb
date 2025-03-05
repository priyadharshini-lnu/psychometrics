# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Saville::MigrateAssessment do
  let(:form) do
    double('form', from_campaign: campaign1.id, to_campaign: campaign2.id, email:, assessment_id: assessment.id)
  end
  let(:email) { 'user@example.com' }
  let(:user1) { create(:user, email:) }
  let(:user2) { create(:user, email:) }
  let(:campaign1) { create(:campaign) }
  let(:campaign2) { create(:campaign) }
  let(:assessment) { create(:assessment, :saville) }

  let(:campaign_user1) { create(:campaign_user, campaign_id: campaign1.id, user_id: user1.id) }
  let(:campaign_user2) { create(:campaign_user, campaign_id: campaign2.id, user_id: user2.id) }
  let(:existing_result) { create(:users_result) }
  let!(:user_assessment1) do
    create(:user_assessment, campaign_id: campaign1.id, users_result_id: existing_result.id,
assessment_id: assessment.id, evaluator: user1)
  end
  let!(:saville_user_assessment_target) do
    create(:saville_user_assessment, user_assessment_id: user_assessment2.id)
  end
  let!(:user_assessment2) do
    create(:user_assessment, campaign_id: campaign2.id, status: 'not_started', assessment_id: assessment.id)
  end
  let(:saville_user_assessment) { create(:saville_user_assessment, user_assessment_id: user_assessment1.id) }

  subject(:migrate_assessment) { described_class.new(form, 1) }

  before do
    allow(CampaignUser).to receive_message_chain(:joins, :find_by).and_return(campaign_user1)
    allow(migrate_assessment).to receive(:target_user_assessment).and_return(user_assessment2)
  end

  describe '#call' do
    it 'finds existing result' do
      expect(migrate_assessment).to receive(:find_existing_result).and_return(existing_result)
      migrate_assessment.call
    end

    it 'creates user result' do
      expect(migrate_assessment).to receive(:create_user_result).with(existing_result).and_call_original
      migrate_assessment.call
    end

    it 'updates target user assessment' do
      expect(user_assessment2).to receive(:save!)
      migrate_assessment.call
    end

    it 'creates saville assessment' do
      expect(migrate_assessment).to receive(:create_saville_assessment).and_call_original
      migrate_assessment.call
    end

    it 'recomputes users results' do
      expect(UsersResults::RecomputeJob).to receive(:perform_later)
      migrate_assessment.call
    end
  end

  describe '#find_existing_result' do
    it 'finds the most recent evaluation result' do
      allow(campaign_user1).to receive_message_chain(:evaluation_results, :order,
                                                     :find_by).and_return(existing_result)
      expect(migrate_assessment.send(:find_existing_result)).to eq(existing_result)
    end
  end

  describe '#create_user_result' do
    context 'when existing result is present' do
      it 'copies the existing result' do
        expect(UsersResults::Copy).to receive(:call!).with(existing_result)
        migrate_assessment.send(:create_user_result, existing_result)
      end
    end

    context 'when existing result is not present' do
      it 'creates a new UsersResult' do
        expect(UsersResult).to receive(:create!)
        migrate_assessment.send(:create_user_result, nil)
      end
    end
  end

  describe '#create_user_assessment' do
    it 'updates the user assessment attributes' do
      target_user_assessment = migrate_assessment.send(:target_user_assessment)
      expect(target_user_assessment.status).to eq(existing_result.status)
      expect(target_user_assessment.completed_at).to eq(existing_result.completed_at)
      expect(target_user_assessment.completion_reason).to eq(existing_result.completion_reason)
    end
  end
end
