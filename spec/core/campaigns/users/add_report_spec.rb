# frozen_string_literal: true

require 'rails_helper'

describe Campaigns::Users::AddReport do
  let(:campaign_user) { create(:campaign_user) }
  let(:report) { create(:report, assessments: [create(:assessment)]) }

  it 'adds UserReport if not already added' do
    expect do
      described_class.call!(campaign_user, report)
    end.to change { UserReport.count }.by(1)
  end

  it "doesn't adds UserReport if it is already added" do
    create(:user_report, report: report, campaign: campaign_user.campaign, user: campaign_user.user)
    expect { described_class.call!(campaign_user, report) }.to_not(change { UserReport.count })
  end

  it 'adds UserAssessment for each report if not present' do
    expect do
      described_class.call!(campaign_user, report)
    end.to change { UserAssessment.count }.by(1)
  end

  it "doesn't add UserAssessment for report if it is already present" do
    create(
      :user_assessment,
      assessment_id: report.assessments.first.id,
      campaign: campaign_user.campaign,
      subject: campaign_user.user,
      evaluator: campaign_user.user,
      relationship: Relationship.self_relationship
    )
    expect do
      described_class.call!(campaign_user, report)
    end.to_not(change { UserAssessment.count })
  end

  it 'calls UserReports::GeneratePdfJob if assessment added to users are already completed' do
    create(
      :user_assessment,
      assessment_id: report.assessments.first.id,
      campaign: campaign_user.campaign,
      subject: campaign_user.user,
      evaluator: campaign_user.user,
      relationship: Relationship.self_relationship,
      users_result: create(:users_result)
    )
    expect(UserReports::GeneratePdfJob).to receive(:perform_later)

    described_class.call!(campaign_user, report)
  end

  it "doesn't calls UserReports::GeneratePdfJob if assessment added to users is not completed" do
    expect(UserReports::GeneratePdfJob).to_not receive(:perform_later)

    described_class.call!(campaign_user, report)
  end

  it 'sets users_result_id if user have previously given the assessment and add_and_allow_new_response is not set' do
    user_result = create(:users_result, evaluator: campaign_user.user, assessment_id: report.assessments.first.id)
    result = described_class.call!(campaign_user, report)

    expect(result[:user_assessments].first.users_result_id).to eq(user_result.id)
  end

  it "doesn't sets users_result_id if operation is set to 'add_and_allow_new_response" do
    create(:users_result, evaluator: campaign_user.user, assessment_id: report.assessments.first.id)
    result = described_class.call!(campaign_user, report, operation: 'add_and_allow_new_response')

    expect(result[:user_assessments].first.users_result_id).to eq(nil)
  end

  it "doesn't sets users_result_id if user have not previously given the assessment" do
    result = described_class.call!(campaign_user, report)

    expect(result[:user_assessments].first.users_result_id).to eq(nil)
  end
end
