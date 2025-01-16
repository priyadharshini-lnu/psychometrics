# frozen_string_literal: true

require 'rails_helper'

describe AdminJobs::BulkRescoreCampaignFactors do
  let!(:campaign) { create(:campaign) }
  let!(:user) { create(:user, email: 'andrew@email.com', first_name: 'Andrew', last_name: 'Wok') }
  let!(:user_one) { create(:user, email: 'james@email.com', first_name: 'James', last_name: 'Bond') }
  let!(:user_two) { create(:user, email: 'bob@email.com', first_name: 'Bob', last_name: 'Jobs') }
  let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }
  let!(:campaign_user_one) { create(:campaign_user, campaign: campaign, user: user_one) }
  let!(:campaign_user_two) { create(:campaign_user, campaign: campaign, user: user_two) }

  let(:job_record) do
    create(
      :admin_job_record, operation: :bulk_rescore_campaign_factors,
      data: {
        user_ids: [user.id, user_one.id, user_two.id],
        campaign_id: campaign.id
      }
    )
  end

  subject { described_class.new(job_record) }

  describe '#call' do
    before do
      allow(CampaignScoring::Rescore).to receive(:call!)
    end

    context 'with user_ids' do
      it 'calls CampaignScoring::Rescore for each users passed as user ids' do
        subject.call

        expect(CampaignScoring::Rescore).to have_received(:call!).with(campaign, user).once
        expect(CampaignScoring::Rescore).to have_received(:call!).with(campaign, user_one).once
        expect(CampaignScoring::Rescore).to have_received(:call!).with(campaign, user_two).once
      end

      it 'broadcasts :ok' do
        expect(subject).to receive(:broadcast).with(:ok)
        subject.call
      end
    end

    context 'with excluded_user_ids' do
      let(:job_record) do
        create(
          :admin_job_record, operation: :bulk_rescore_campaign_factors,
          data: {
            user_ids: [],
            excluded_user_ids: [user_two.id],
            campaign_id: campaign.id
          }
        )
      end

      it 'calls CampaignScoring::Rescore for all users except excluded ones' do
        subject.call

        expect(CampaignScoring::Rescore).to have_received(:call!).with(campaign, user).once
        expect(CampaignScoring::Rescore).to have_received(:call!).with(campaign, user_one).once
        expect(CampaignScoring::Rescore).not_to have_received(:call!).with(campaign, user_two)
      end

      it 'broadcasts :ok' do
        expect(subject).to receive(:broadcast).with(:ok)
        subject.call
      end
    end
  end
end
