# frozen_string_literal: true

require 'rails_helper'

describe Campaigns::GetWorkshopActivity do
  context '.call' do
    let(:campaign) { create(:campaign) }
    let(:user_assessment) { create(:user_assessment, campaign: campaign, status: 2) }
    let!(:campaign_assessment) do
      create(:campaign_assessment, assessment: user_assessment.assessment, campaign: campaign,
        prework: true, workshop_activity: true)
    end

    before do
      Timecop.return
    end

    subject { described_class.call(campaign.id) }

    it { expect { subject }.to broadcast(:ok) }

    it 'returns workshop_activity count' do
      expect(subject[:ok]).to eq(user_assessment.subject_id => { 'completed' => 1, 'total' => 1 })

      subject
    end

    context 'without workshop_activity' do
      let!(:campaign_assessment) do
        create(:campaign_assessment, assessment: user_assessment.assessment, campaign: campaign)
      end

      it { expect { subject }.to broadcast(:ok) }

      it 'returns preworks count' do
        expect(subject[:ok]).to eq({})

        subject
      end
    end
  end
end
