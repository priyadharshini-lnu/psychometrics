# frozen_string_literal: true

require 'rails_helper'

describe Campaigns::Reports::Add do
  let(:campaign) { create(:campaign) }
  let(:report) { create(:report, assessments: create_list(:assessment, 2)) }
  let(:form) do
    Campaigns::Reports::Form.new(report_ids: report.id, report_access: { report.id.to_s => true })
  end

  it 'create CampaigsReport if not present' do
    expect do
      described_class.call!(form, campaign)
    end.to change { CampaignsReport.count }.by(1)
  end

  it "doesn't create CampaignsReport if it is already present" do
    create(:campaigns_report, campaign: campaign, report: report)
    expect do
      described_class.call!(form, campaign)
    end.to_not(change { CampaignsReport.count })
  end

  it 'user_access is set to true in CampaignsReport if report access is given' do
    form.report_access = { report.id.to_s => true }
    described_class.call!(form, campaign)
    campaign_report = campaign.campaigns_reports.first

    expect(campaign_report.user_access).to eq(true)
  end

  it 'user_access is set to false in CampaignsReport if report access is not given' do
    form.report_access = { report.id.to_s => false }
    described_class.call!(form, campaign)
    campaign_report = campaign.campaigns_reports.first

    expect(campaign_report.user_access).to eq(false)
  end

  it 'creates CampaignAsssessment record for each assessment in report' do
    expect do
      described_class.call!(form, campaign)
    end.to change { CampaignsAssessment.count }.by(2)
  end

  it "doesn't call Campaigns::Users::AddReport record for campaign_user if operation is 'skip_existing'" do
    create(:campaigns_user, campaign: campaign)
    form.operation = 'skip_existing'
    expect(Campaigns::Users::AddReport).to_not receive(:call!)

    described_class.call!(form, campaign)
  end

  it "call Campaigns::Users::AddReport record for campaign_user if operation is not 'skip_existing'" do
    campaigns_user = create(:campaigns_user, campaign: campaign)
    form.operation = 'add_and_allow_new_response'

    expect(Campaigns::Users::AddReport).to receive(:call!).with(
      campaigns_user,
      report,
      user_access: true,
      operation: form.operation,
      use_license: true
    )

    described_class.call!(form, campaign)
  end
end
