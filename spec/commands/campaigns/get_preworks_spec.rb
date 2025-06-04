# frozen_string_literal: true

require 'rails_helper'

describe Campaigns::GetPreworks do
  context '.call' do
    let(:campaign) { create(:campaign) }
    let(:user_assessment) { create(:user_assessment, campaign: campaign, status: 'completed', prework: true) }
    let!(:campaign_assessment) do
      create(:campaign_assessment, assessment: user_assessment.assessment, campaign: campaign,
        prework: true, workshop_activity: true)
    end

    before do
      Timecop.return
    end

    subject { described_class.call(campaign.id) }

    it { expect { subject }.to broadcast(:ok) }

    it 'returns preworks count' do
      expect(subject[:ok]).to eq(user_assessment.subject_id => { 'completed' => 1, 'total' => 1 })

      subject
    end

    context 'without preworks' do
      let(:user_assessment) { create(:user_assessment, campaign: campaign, status: 'completed', prework: false) }
      let!(:campaign_assessment) do
        create(:campaign_assessment, assessment: user_assessment.assessment, campaign: campaign)
      end

      it { expect { subject }.to broadcast(:ok) }

      it 'returns preworks count' do
        expect(subject[:ok]).to eq({})

        subject
      end
    end

    context 'with different user IDs' do
      let(:user1) { create(:user) }
      let(:user2) { create(:user) }

      let!(:user_assessment1) do
        create(:user_assessment, campaign: campaign, status: 'completed', subject_id: user1.id, prework: true)
      end
      let!(:user_assessment2) do
        create(:user_assessment, campaign: campaign, status: 'in_progress', subject_id: user2.id, prework: true)
      end
      let!(:campaign_assessment1) do
        create(:campaign_assessment, assessment: user_assessment1.assessment, campaign: campaign, prework: true,
       workshop_activity: true)
      end
      let!(:campaign_assessment2) do
        create(:campaign_assessment, assessment: user_assessment2.assessment, campaign: campaign, prework: true,
       workshop_activity: true)
      end

      it 'returns preworks count for user1' do
        result = described_class.call(campaign.id, user1.id)
        expect(result[:ok]).to eq(user1.id => { 'completed' => 1, 'total' => 1 })
      end

      it 'returns preworks count for user2' do
        result = described_class.call(campaign.id, user2.id)
        expect(result[:ok]).to eq(user2.id => { 'completed' => 0, 'total' => 1 })
      end
    end

    context 'with mixed prework settings' do
      let(:user1) { create(:user) }
      let(:user2) { create(:user) }
      let(:assessment) { create(:assessment) }

      let!(:user_assessment1) do
        create(:user_assessment, campaign: campaign, assessment: assessment, status: 'completed',
               subject_id: user1.id, prework: true)
      end
      let!(:user_assessment2) do
        create(:user_assessment, campaign: campaign, assessment: assessment, status: 'completed',
               subject_id: user2.id, prework: false)
      end
      let!(:campaign_assessment) do
        create(:campaign_assessment, assessment: assessment, campaign: campaign)
      end

      it 'only counts prework for users with prework enabled' do
        result = described_class.call(campaign.id)
        expect(result[:ok]).to eq(user1.id => { 'completed' => 1, 'total' => 1 })
        # user2 should not appear in results since prework is false
      end
    end

    context 'with prework override per user' do
      let(:user1) { create(:user) }
      let(:user2) { create(:user) }
      let(:user3) { create(:user) }
      let(:assessment) { create(:assessment) }

      let!(:user_assessment1) do
        create(:user_assessment, campaign: campaign, assessment: assessment, status: 'completed',
               subject_id: user1.id, prework: true)
      end
      let!(:user_assessment2) do
        create(:user_assessment, campaign: campaign, assessment: assessment, status: 'not_started',
               subject_id: user2.id, prework: true)
      end
      let!(:user_assessment3) do
        create(:user_assessment, campaign: campaign, assessment: assessment, status: 'completed',
               subject_id: user3.id, prework: false)
      end
      let!(:campaign_assessment) do
        create(:campaign_assessment, assessment: assessment, campaign: campaign)
      end

      it 'respects individual user prework settings' do
        result = described_class.call(campaign.id)
        expected_result = {
          user1.id => { 'completed' => 1, 'total' => 1 },
          user2.id => { 'completed' => 0, 'total' => 1 }
        }
        expect(result[:ok]).to eq(expected_result)
        # user3 should not appear since prework is disabled for them
      end
    end
  end
end
