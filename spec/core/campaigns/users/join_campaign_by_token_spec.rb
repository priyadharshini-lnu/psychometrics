# frozen_string_literal: true

require 'rails_helper'

describe Campaigns::Users::JoinCampaignByToken do
  let!(:current_user) { create(:user, :with_project_membership) }
  let!(:campaign) { create(:campaign, project: current_user.project) }
  let!(:token) { Campaigns::JwtTokenizer.encode({ campaign_id: campaign.id, subject_id: current_user.id }) }

  before(:each) do
    allow(Licenses::Use).to receive(:call!)
  end

  it "creates campaign user record if user doesn't exists in the project" do
    described_class.call!(current_user, token)
    expect(campaign.campaign_users.exists?(user_id: current_user.id)).to be_truthy
  end

  it "doesn't create campaign user record if campaign user already exists in the project" do
    create(:campaign_user, campaign: campaign, user: current_user)
    expect do
      described_class.call!(current_user, token)
    end.to_not(change { CampaignUser.count })
  end

  context 'add report and license usage' do
    before(:each) do
      reports = create_list(:report, 2)
      campaign_report1 = create(:campaign_report, campaign: campaign, report: reports[0])
      create(:campaign_report, campaign: campaign, report: reports[1])
      report_family = campaign_report1.report.report_families.first

      create(
        :license,
        report_family: report_family,
        client: campaign.client,
        start_date: 2.days.ago,
        end_date: 2.days.since
      )
    end

    it 'call Campaigns::Users::AddReport for each campaign_report' do
      expect(Campaigns::Users::AddReport).to receive(:call!).twice

      described_class.call!(current_user, token)
    end
  end
end
