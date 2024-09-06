# frozen_string_literal: true

require 'rails_helper'

describe UserReports::GetUserResultsQuery do
  let(:assessments) { create_list(:assessment, 2) }
  let(:lead_assessment) { create(:assessment, category: :lead_assessor_form) }
  let(:report) { create(:report, assessments: assessments) }
  let(:user_report) { create(:user_report, report: report) }
  let(:campaign) { user_report.campaign }
  let(:user) { user_report.user }

  it 'gets completed UsersResult for the UserReport from the campaign where UserReport is added' do
    completed_users_assessment = create(:user_assessment, :with_result, campaign: campaign,
      assessment: assessments[0], subject: user, evaluator: user, status: :completed, score_calculated: true)
    in_progress_users_assessment = create(:user_assessment, :with_result, campaign: campaign,
      assessment: assessments[1], subject: user, evaluator: user, status: :in_progress)

    users_results = described_class.new(user_report, :admin).query

    expect(users_results).to include(completed_users_assessment.users_result)
    expect(users_results).to_not include(in_progress_users_assessment.users_result)
  end

  it 'it picks up latest UsersResult from different campaign if UsersResult for particular
    assessment is not present in same campaign' do
    same_campaign_users_assessment = create(:user_assessment, :with_result, campaign: campaign,
      assessment: assessments[0], subject: user, evaluator: user, status: :completed, score_calculated: true)
    different_campaign_user_assessment1 = create(:user_assessment, :with_result, campaign: create(:campaign),
      assessment: assessments[1], subject: user, evaluator: user, status: :completed, completed_at: Time.zone.now,
      score_calculated: true)
    different_campaign_user_assessment2 = create(:user_assessment, :with_result, campaign: create(:campaign),
      assessment: assessments[1], subject: user, evaluator: user, status: :completed,
      completed_at: Time.zone.now.advance(days: 2), score_calculated: true)

    users_results = described_class.new(user_report, :admin).query

    expect(users_results).to include(same_campaign_users_assessment.users_result)
    expect(users_results).to include(different_campaign_user_assessment2.users_result)
    expect(users_results).to_not include(different_campaign_user_assessment1.users_result)
  end

  it "doesn't pick UsersResult for another campaign if UsersResult is present
    in the campaign where UserReport is added" do
    same_campaign_users_assessment1 = create(:user_assessment, :with_result, campaign: campaign,
      assessment: assessments[0], subject: user, evaluator: user, status: :completed, score_calculated: true)
    same_campaign_users_assessment2 = create(:user_assessment, :with_result, campaign: campaign,
      assessment: assessments[1], subject: user, evaluator: user, status: :completed, completed_at: Time.zone.now,
      score_calculated: true)
    different_campaign_user_assessment = create(:user_assessment, :with_result, campaign: create(:campaign),
      assessment: assessments[1], subject: user, evaluator: user, status: :completed,
      completed_at: Time.zone.now.advance(days: 2), score_calculated: true)

    users_results = described_class.new(user_report, :admin).query

    expect(users_results).to include(same_campaign_users_assessment1.users_result)
    expect(users_results).to include(same_campaign_users_assessment2.users_result)
    expect(users_results).to_not include(different_campaign_user_assessment.users_result)
  end

  it "doesn't pick UsersResult for another campaign if UsersResult is present and not completed" do
    same_campaign_users_result = create(:user_assessment, :with_result, campaign: campaign,
      assessment: assessments[1], subject: user, evaluator: user, status: :not_started)
    different_campaign_user_result = create(:user_assessment, :with_result, campaign: create(:campaign),
      assessment: assessments[1], subject: user, evaluator: user, status: :completed,
      completed_at: Time.zone.now.advance(days: 2), score_calculated: true)

    users_results = described_class.new(user_report, :admin).query

    expect(users_results).to_not include(same_campaign_users_result)
    expect(users_results).to_not include(different_campaign_user_result)
  end

  it "don't pick UsersResult for non lead assessor assessment" do
    same_campaign_users_assessment1 = create(:user_assessment, :with_result, campaign: campaign,
      assessment: assessments[0], subject: user, evaluator: user, status: :completed, score_calculated: true)
    same_campaign_users_assessment2 = create(:user_assessment, :with_result, campaign: campaign,
      assessment: lead_assessment, subject: user, evaluator: user, status: :in_progress, completed_at: Time.zone.now)

    users_results = described_class.new(user_report, :admin).query

    expect(users_results).to include(same_campaign_users_assessment1.users_result)
    expect(users_results).to_not include(same_campaign_users_assessment2.users_result)
  end

  it 'pick UsersResult for lead assessor assessment' do
    report.assessments_reports.create(assessment_id: lead_assessment.id, report_id: report.id)
    same_campaign_users_assessment1 = create(:user_assessment, :with_result, campaign: campaign,
      assessment: assessments[0], subject: user, evaluator: user, status: :completed, score_calculated: true)
    same_campaign_users_assessment2 = create(:user_assessment, :with_result, campaign: campaign,
      assessment: lead_assessment, subject: user, evaluator: user, status: :in_progress, completed_at: Time.zone.now)
    users_results = described_class.new(user_report.reload, :lead_assessor).query

    expect(users_results).to include(same_campaign_users_assessment1.users_result)
    expect(users_results).to include(same_campaign_users_assessment2.users_result)
  end
end
