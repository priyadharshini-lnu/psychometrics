# frozen_string_literal: true

require 'rails_helper'

describe CampaignUsers::AssignReportsAndAssessments::ProcessImport do
  let!(:campaign) { create(:campaign) }
  let!(:current_user) { create(:user) }
  let!(:assessment) { create(:assessment) }
  let!(:assessment2) { create(:assessment) }
  let!(:report) { create(:report, assessments: [assessment]) }
  let!(:report2) { create(:report, assessments: [assessment2]) }

  let!(:extra_report) { create(:report) }
  let!(:extra_assessment) { create(:assessment) }
  let!(:norm) { create(:norm) }
  let!(:user) { create(:user, email: 'john@cc.com') }
  let!(:user2) { create(:user, email: 'smith@cc.com') }
  let!(:campaign_user1) { create(:campaign_user, campaign: campaign, user: user) }
  let!(:campaign_user2) { create(:campaign_user, campaign: campaign, user: user2) }

  let(:admin_job_record) { create(:admin_job_record) }
  let(:import_data) do
    [
      {
        email: 'john@cc.com',
        report_bundle_id: report.report_families.first.id,
        report_id: report.id,
        assessment_id: assessment.id,
        norm_id: norm.id
      },
      {
        email: 'John@cc.com',
        report_bundle_id: report2.report_families.first.id,
        report_id: report2.id,
        assessment_id: assessment2.id,
        norm_id: norm.id
      },
      {
        email: 'SMITH@cc.com',
        report_bundle_id: report.report_families.first.id,
        report_id: report.id,
        assessment_id: assessment.id,
        norm_id: norm.id
      },
      {
        email: 'smith@cc.com',
        report_bundle_id: report.report_families.first.id,
        report_id: report.id,
        assessment_id: assessment.id,
        norm_id: norm.id
      }
    ]
  end

  it '.call' do
    allow(Licenses::Use).to receive(:call!)

    described_class.call!(
      campaign, current_user, import_data, admin_job_record
    )

    user1 = campaign.users.find_by(email: 'john@cc.com')
    user2 = campaign.users.find_by(email: 'smith@cc.com')
    user1_campaign_user = campaign.campaign_users.find_by(user_id: user1.id)
    user2_campaign_user = campaign.campaign_users.find_by(user_id: user2.id)

    expect(user1_campaign_user.user_reports.count).to eq(2)
    expect(user1_campaign_user.user_reports.find_by(report_id: report.id)).to be_present
    expect(user1_campaign_user.user_reports.find_by(report_id: report2.id)).to be_present
    expect(user1_campaign_user.user_assessments.count).to eq(2)
    expect(user1_campaign_user.user_assessments.find_by(assessment_id: assessment.id)).to be_present
    expect(user1_campaign_user.user_assessments.find_by(assessment_id: assessment2.id)).to be_present
    expect(user2_campaign_user.user_reports.count).to eq(1)
    expect(user2_campaign_user.user_reports.find_by(report_id: report.id)).to be_present
  end

  it 'raises Licenses::NotEnoughError' do
    described_class.call!(
      campaign, current_user, import_data, admin_job_record
    )

    expect(admin_job_record.exception).to eq("'Client Tenancy 3' does not have enough licenses for 'report 6'")
  end
end
