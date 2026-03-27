# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CampaignUsers::ChangeCampaignArtifactResultsFinalized do
  let(:campaign) { create(:campaign) }
  let(:current_user) { create(:user) }
  let(:users) { create_list(:user, 3) }
  let(:user_ids) { users.map(&:id) }
  let!(:campaign_users) do
    users.map { |user| create(:campaign_user, campaign: campaign, user: user) }
  end
  let(:other_user) { create(:user) }
  let!(:other_campaign_user) { create(:campaign_user, campaign: campaign, user: other_user) }

  let(:ai_artifact_report) { create(:report_campaign_ai_artifact).report }

  before do
    users.each do |user|
      create(:user_report, user: user, campaign: campaign, report: ai_artifact_report)
    end
    create(:user_report, user: other_user, campaign: campaign, report: ai_artifact_report)
  end

  describe '#call' do
    context 'when finalizing artifact results for specific users' do
      subject(:finalize) do
        described_class.call!(
          campaign: campaign,
          user_ids: user_ids,
          current_user: current_user,
          artifact_results_finalized: true
        )
      end

      it 'sets campaign_artifact_results_finalized and finalized_at for specified users' do
        finalize
        campaign_users.each do |cu|
          cu.reload
          expect(cu.campaign_artifact_results_finalized).to be true
          expect(cu.campaign_artifact_results_finalized_at).to be_within(1.second).of(Time.current)
        end
      end

      it 'does not affect other users in the campaign' do
        finalize
        other_campaign_user.reload
        expect(other_campaign_user.campaign_artifact_results_finalized).to be false
        expect(other_campaign_user.campaign_artifact_results_finalized_at).to be_nil
      end

      it 'enqueues PDF generation job for the specified users reports' do
        expected_report_ids = UserReport.where(user_id: user_ids, campaign_id: campaign.id).pluck(:id)
        configured_job = instance_double(ActiveJob::ConfiguredJob)
        allow(UserReports::GenerateAndSavePdfJob).to receive(:set).with(wait: 30.seconds).and_return(configured_job)
        expect(configured_job).to receive(:perform_later).with(match_array(expected_report_ids), current_user)

        finalize
      end
    end

    context 'when unfinalizing artifact results for specific users' do
      subject(:unfinalize) do
        described_class.call!(
          campaign: campaign,
          user_ids: user_ids,
          current_user: current_user,
          artifact_results_finalized: false
        )
      end

      before do
        campaign_users.each do |cu|
          cu.update!(campaign_artifact_results_finalized: true,
                     campaign_artifact_results_finalized_at: 1.hour.ago)
        end
      end

      it 'clears campaign_artifact_results_finalized and finalized_at for specified users' do
        unfinalize
        campaign_users.each do |cu|
          cu.reload
          expect(cu.campaign_artifact_results_finalized).to be false
          expect(cu.campaign_artifact_results_finalized_at).to be_nil
        end
      end

      it 'does not affect other users in the campaign' do
        unfinalize
        other_campaign_user.reload
        expect(other_campaign_user.campaign_artifact_results_finalized).to be false
      end

      it 'enqueues PDF removal job for the specified users reports' do
        expected_report_ids = UserReport.where(user_id: user_ids, campaign_id: campaign.id).pluck(:id)
        expect(UserReports::RemovePdfJob).to receive(:perform_later).
          with(match_array(expected_report_ids))

        unfinalize
      end
    end
  end
end
