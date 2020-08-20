# frozen_string_literal: true

require 'rails_helper'

describe CampaignReports::Remove do
  let(:campaign) { create(:campaign) }
  let(:report) { create(:report) }
  let(:campaign_report) { create(:campaign_report, campaign: campaign, report: report) }
  let!(:user_report) { create(:user_report, campaign: campaign, report: report) }
  let!(:user_report_1) { create(:user_report, campaign: campaign) }
  let(:options) { { campaign_report: campaign_report, remove_user_reports: false } }
  let(:options_with_remove_user_report) { { campaign_report: campaign_report, remove_user_reports: true } }

  it 'deletes only campaign_report record if remove_user_reports flag is false' do
    described_class.call!(options)

    expect(CampaignReport.find_by(id: campaign_report.id)).to be_nil
    expect(UserReport.find_by(id: user_report.id)).to eq(user_report)
  end

  it 'deletes campaign_report and user_reports if remove_user_reports flag is true' do
    described_class.call!(options_with_remove_user_report)

    expect(CampaignReport.find_by(id: campaign_report.id)).to be_nil
    expect(UserReport.find_by(id: user_report.id)).to be_nil
  end

  it 'do not removes user_report associated with different report if remove_user_reports flag is true' do
    described_class.call!(options_with_remove_user_report)

    expect(UserReport.find_by(id: user_report_1.id)).to eq(user_report_1)
  end
end
