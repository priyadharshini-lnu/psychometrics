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
    end.to change { CampaignReport.count }.by(1)
  end

  it "doesn't create CampaignReport if it is already present" do
    create(:campaign_report, campaign: campaign, report: report)
    expect do
      described_class.call!(form, campaign)
    end.to_not(change { CampaignReport.count })
  end

  it 'user_access is set to true in CampaignReport if report access is given' do
    form.report_access = { report.id.to_s => true }
    described_class.call!(form, campaign)
    campaign_report = campaign.campaign_reports.first

    expect(campaign_report.user_access).to eq(true)
  end

  it 'user_access is set to false in CampaignReport if report access is not given' do
    form.report_access = { report.id.to_s => false }
    described_class.call!(form, campaign)
    campaign_report = campaign.campaign_reports.first

    expect(campaign_report.user_access).to eq(false)
  end

  it 'creates CampaignAsssessment record for each assessment in report' do
    expect do
      described_class.call!(form, campaign)
    end.to change { CampaignAssessment.count }.by(2)
  end

  it 'saves saville_norm_id if campaign assessment is a saville assessment' do
    assessment = create(:assessment, :saville)
    report = create(:report, assessments: [assessment])
    form = Campaigns::Reports::Form.new(report_ids: report.id, report_access: { report.id.to_s => true })
    described_class.call!(form, campaign)

    expect(assessment.campaign_assessments.first.saville_norm_id).to eq(assessment.saville_norm_id)
  end

  it "doesn't call Campaigns::Users::AddReport record for campaign_user if operation is 'skip_existing'" do
    create(:campaign_user, campaign: campaign)
    form.operation = 'skip_existing'
    expect(Campaigns::Users::AddReport).to_not receive(:call!)

    described_class.call!(form, campaign)
  end

  it "call Campaigns::Users::AddReport record for campaign_user if operation is not 'skip_existing'" do
    campaign_user = create(:campaign_user, campaign: campaign)
    form.operation = 'add_and_allow_new_response'

    expect(Campaigns::Users::AddReport).to receive(:call!).with(
      campaign_user,
      report,
      report_family_id: nil,
      user_access: true,
      operation: form.operation,
      assessments: report.assessments
    )

    described_class.call!(form, campaign)
  end
end
