# frozen_string_literal: true

require 'rails_helper'

describe Campaigns::Users::JoinCampaign do
  let!(:campaign) { create(:campaign) }
  let!(:current_user) { create(:user) }
  let!(:registration_code) { create(:registration_code, project: campaign.project, campaign: campaign, use_count: 0) }
  before(:each) do
    allow(Licenses::Use).to receive(:call!)
  end

  it "creates campaign user record if user doesn't exists in the project" do
    described_class.call!(current_user, campaign, registration_code)
    expect(campaign.campaign_users.exists?(user_id: current_user.id)).to be_truthy
    expect(registration_code.use_count).to eq(1)
  end

  it "doesn't create campaign user record if campaign user already exists in the project" do
    create(:campaign_user, campaign: campaign, user: current_user)
    expect do
      described_class.call!(current_user, campaign, registration_code)
    end.to_not(change { CampaignUser.count })
  end

  context 'add report and license usage' do
    let(:report) { create(:report) }
    let!(:campaign_reports) { create_list(:campaign_report, 2, report: report, campaign: campaign) }
    let(:report_family) { report.report_families.first }
    let!(:license) do
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

      described_class.call!(current_user, campaign, registration_code)
    end
  end
end
