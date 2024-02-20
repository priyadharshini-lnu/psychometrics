# frozen_string_literal: true

require 'rails_helper'

describe CampaignUsers::ChangeCampaignScoreFinalized do
  let(:super_admin) { create(:superadmin) }
  let!(:campaign_user) { create :campaign_user, campaign_scores_finalized: false }
  let(:campaign) { campaign_user.campaign }
  let(:user) { campaign_user.user }
  let!(:campaign_factor_dependent_user_report) do
    create(:user_report, campaign: campaign, user: user,
      report: create(:report, campaign_factors: [{ name: 'test', code: 'text' }]))
  end
  let!(:non_campaign_factor_dependent_user_report) do
    create(:user_report, campaign: campaign, user: user,
      report: create(:report, campaign_factors: []))
  end

  it 'marks campaign_scores_finalized and generates report dependent on campaign factor' do
    expect(UserReports::GenerateAndSavePdfJob).to receive(:perform_later).
      with([campaign_factor_dependent_user_report.id], super_admin)
    described_class.call!(
      campaign: campaign,
      user_ids: [user.id],
      current_user: super_admin,
      campaign_score_finalized: true
    )

    expect(campaign_user.reload.campaign_scores_finalized).to eq(true)
  end

  it 'remove campaign_scores_finalized and removes report dependent on campaign factor' do
    campaign_user.update!(campaign_scores_finalized: true)
    expect(UserReports::RemovePdfJob).to receive(:perform_later).
      with([campaign_factor_dependent_user_report.id])
    perform_enqueued_jobs do
      described_class.call!(
        campaign: campaign,
        user_ids: [user.id],
        current_user: super_admin,
        campaign_score_finalized: false
      )
    end

    expect(campaign_user.reload.campaign_scores_finalized).to eq(false)
  end
end
