# frozen_string_literal: true

require 'rails_helper'

describe UsersResults::GenerateReports do
  it 'calls GenerateAndSavePdfJob for each report which is dependent on user_result' do
    user = create(:user, :with_project_membership)
    assessment = create(:assessment, :with_report)
    campaign = create(:campaign, project: user.project)
    user_result = create(:users_result, subject: user, evaluator: user, assessment: assessment)

    create(:user_assessment,
           campaign: campaign, assessment: assessment, subject: user, evaluator: user, users_result: user_result)

    user_report = create(:user_report, campaign: campaign, report_id: assessment.reports.first.id, user: user)

    expect(UserReports::GenerateAndSavePdfJob).to receive(:perform_later).with(user_report, user)

    described_class.call!(user_result, user)
  end

  it "doesn't generate report if user_report id is in exceptUserReportIds option" do
    user_result = build(:users_result)
    user_reports = create_list(:user_report, 2)
    user = build(:user)

    allow(user_result).to receive(:user_reports).and_return(user_reports)

    expect(UserReports::GenerateAndSavePdfJob).to_not receive(:perform_later).with(user_reports[0], user)
    expect(UserReports::GenerateAndSavePdfJob).to receive(:perform_later).with(user_reports[1], user)
    described_class.call!(user_result, user, exceptUserReportIds: [user_reports[0].id])
  end

  it "doesn't generate report if user_report has approval workflow" do
    user = create(:user, :with_project_membership)
    assessment = create(:assessment, :with_report)
    campaign = create(:campaign, project: user.project)
    user_report = create(:user_report, campaign: campaign, report: assessment.reports[0], user: user)
    create(:report_approval_setting, campaign: campaign, report: user_report.report)
    user_result = create(:users_result, campaign: campaign, subject: user, evaluator: user)
    create(:user_assessment, campaign: campaign, assessment: assessment, subject: user,
           evaluator: user, users_result: user_result)

    described_class.call!(user_result, user)
    expect(UserReports::GenerateAndSavePdfJob).to_not receive(:perform_later).with(user_report, user)
  end
end
