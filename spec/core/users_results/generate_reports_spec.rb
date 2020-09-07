# frozen_string_literal: true

require 'rails_helper'

describe ::UsersResults::GenerateReports do
  it 'calls GenerateAndSavePdfJob for each report which is dependent on user_result' do
    user = create(:user, :with_project_membership)
    assessment = create(:assessment, :with_report)
    campaign1 = create(:campaign, project: user.project)
    campaign2 = create(:campaign, project: user.project)
    user_result = create(:users_result, subject: user, evaluator: user, assessment: assessment)

    create(:user_assessment,
           campaign: campaign1, assessment: assessment, subject: user, evaluator: user, users_result: user_result)
    create(:user_assessment,
           campaign: campaign2, assessment: assessment, subject: user, evaluator: user, users_result: user_result)

    user_report1 = create(:user_report, campaign: campaign1, report_id: assessment.reports.first.id, user: user)
    user_report2 = create(:user_report, campaign: campaign2, report_id: assessment.reports.first.id, user: user)

    expect(UserReports::GenerateAndSavePdfJob).to receive(:perform_later).with(user_report1, user)
    expect(UserReports::GenerateAndSavePdfJob).to receive(:perform_later).with(user_report2, user)

    described_class.call!(user_result, user)
  end
end
