# frozen_string_literal: true

require 'rails_helper'

describe Campaigns::GetPreworks do
  context '.call' do
    let(:campaign) { create(:campaign) }
    let(:user_assessment) { create(:user_assessment, campaign: campaign, status: 'completed') }
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
        create(:user_assessment, campaign: campaign, status: 'completed', subject_id: user1.id)
      end
      let!(:user_assessment2) do
        create(:user_assessment, campaign: campaign, status: 'in_progress', subject_id: user2.id)
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
  end
end
