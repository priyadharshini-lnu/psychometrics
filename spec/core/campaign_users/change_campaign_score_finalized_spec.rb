# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CampaignUsers::ChangeCampaignScoreFinalized do
  let(:campaign) { create(:campaign) }
  let(:current_user) { create(:user) }
  let(:users) { create_list(:user, 3) }
  let(:user_ids) { users.map(&:id) }
  let!(:campaign_users) do
    users.map { |user| create(:campaign_user, campaign: campaign, user: user) }
  end
  let(:excluded_user) { create(:user) }
  let!(:excluded_campaign_user) { create(:campaign_user, campaign: campaign, user: excluded_user) }

  before do
    # Create some user reports
    users.each.with_index do |user, index|
      create(:user_report,
             user: user,
             campaign: campaign,
             report: create(:report_campaign_factor, code: "factor#{index}", name: "Factor #{index}",
output_type: 'numeric').report)
    end

    create(:user_report,
           user: excluded_user,
           campaign: campaign,
           report: create(:report_campaign_factor, code: 'exclude', name: 'Exclude', output_type: 'numeric').report)
  end

  describe '#call' do
    context 'when finalizing scores for specific users' do
      subject(:change_finalized) do
        described_class.new(
          campaign: campaign,
          user_ids: user_ids,
          current_user: current_user,
          campaign_score_finalized: true,
          exclude: false
        ).call
      end

      it 'updates campaign_scores_finalized for specified users' do
        change_finalized
        campaign_users.each do |cu|
          cu.reload
          expect(cu.campaign_scores_finalized).to be true
          expect(cu.campaign_scores_finalized_date).to eq Time.current
        end

        # Verify excluded user's campaign_user wasn't affected
        excluded_campaign_user.reload
        expect(excluded_campaign_user.campaign_scores_finalized).to be false
        expect(excluded_campaign_user.campaign_scores_finalized_date).to be_nil
      end

      it 'enqueues PDF generation job for specified users' do
        expect(UserReports::GenerateAndSavePdfJob).to receive(:perform_later).
          with(match_array(UserReport.where(user_id: user_ids).pluck(:id)), current_user)

        change_finalized
      end
    end

    context 'when unfinalizing scores for specific users' do
      subject(:change_unfinalized) do
        described_class.new(
          campaign: campaign,
          user_ids: user_ids,
          current_user: current_user,
          campaign_score_finalized: false,
          exclude: false
        ).call
      end

      it 'updates campaign_scores_finalized to false' do
        change_unfinalized
        campaign_users.each do |cu|
          cu.reload
          expect(cu.campaign_scores_finalized).to be false
          expect(cu.campaign_scores_finalized_date).to be_nil
        end
      end

      it 'enqueues PDF removal job for specified users' do
        expect(UserReports::RemovePdfJob).to receive(:perform_later).
          with(match_array(UserReport.where(user_id: user_ids).pluck(:id)))

        change_unfinalized
      end
    end

    context 'when using exclude option' do
      subject(:change_finalized_with_exclude) do
        described_class.new(
          campaign: campaign,
          user_ids: user_ids,
          current_user: current_user,
          campaign_score_finalized: true,
          exclude: true
        ).call
      end

      it 'updates campaign_scores_finalized for non-specified users' do
        change_finalized_with_exclude

        # Specified users should not be affected
        campaign_users.each do |cu|
          cu.reload
          expect(cu.campaign_scores_finalized).to be false
          expect(cu.campaign_scores_finalized_date).to be_nil
        end

        # Excluded user should be affected
        excluded_campaign_user.reload
        expect(excluded_campaign_user.campaign_scores_finalized).to be true
        expect(excluded_campaign_user.campaign_scores_finalized_date).to eq Time.current
      end

      it 'enqueues PDF generation job for excluded users' do
        expect(UserReports::GenerateAndSavePdfJob).to receive(:perform_later).
          with(match_array(UserReport.where(user_id: excluded_user.id).pluck(:id)), current_user)

        change_finalized_with_exclude
      end
    end
  end
end
