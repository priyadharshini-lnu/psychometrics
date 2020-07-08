# frozen_string_literal: true

require 'rails_helper'

describe Campaigns::Users::AddReport do
  let(:campaigns_user) { create(:campaigns_user) }
  let(:report) { create(:report, assessments: [create(:assessment)]) }

  it 'adds CampaignsUsersReport if not already added' do
    expect do
      described_class.call!(campaigns_user, report)
    end.to change { CampaignsUsersReport.count }.by(1)
  end

  it "doesn't adds CampaignsUsersReport if it is already added" do
    create(:campaigns_users_report, report: report, campaign: campaigns_user.campaign, user: campaigns_user.user)
    expect { described_class.call!(campaigns_user, report) }.to_not(change { CampaignsUsersReport.count })
  end

  it 'adds UsersCampaignsAssessment for each report if not present' do
    expect do
      described_class.call!(campaigns_user, report)
    end.to change { UsersCampaignsAssessment.count }.by(1)
  end

  it "doesn't add UsersCampaignsAssessment for report if it is already present" do
    create(
      :users_campaigns_assessment,
      assessment_id: report.assessments.first.id,
      campaign: campaigns_user.campaign,
      subject: campaigns_user.user,
      evaluator: campaigns_user.user,
      relationship: Relationship.self_relationship
    )
    expect do
      described_class.call!(campaigns_user, report)
    end.to_not(change { UsersCampaignsAssessment.count })
  end

  it 'calls CampaignsUsersReports::GeneratePdfJob if assessment added to users are already completed' do
    create(
      :users_campaigns_assessment,
      assessment_id: report.assessments.first.id,
      campaign: campaigns_user.campaign,
      subject: campaigns_user.user,
      evaluator: campaigns_user.user,
      relationship: Relationship.self_relationship,
      users_result: create(:users_result)
    )
    expect(CampaignsUsersReports::GeneratePdfJob).to receive(:perform_later)

    described_class.call!(campaigns_user, report)
  end

  it "doesn't calls CampaignsUsersReports::GeneratePdfJob if assessment added to users is not completed" do
    expect(CampaignsUsersReports::GeneratePdfJob).to_not receive(:perform_later)

    described_class.call!(campaigns_user, report)
  end

  it 'sets users_result_id if user have previously given the assessment and add_and_allow_new_response is not set' do
    user_result = create(:users_result, evaluator: campaigns_user.user, assessment_id: report.assessments.first.id)
    result = described_class.call!(campaigns_user, report)

    expect(result[:users_campaigns_assessments].first.users_result_id).to eq(user_result.id)
  end

  it "doesn't sets users_result_id if operation is set to 'add_and_allow_new_response" do
    create(:users_result, evaluator: campaigns_user.user, assessment_id: report.assessments.first.id)
    result = described_class.call!(campaigns_user, report, operation: 'add_and_allow_new_response')

    expect(result[:users_campaigns_assessments].first.users_result_id).to eq(nil)
  end

  it "doesn't sets users_result_id if user have not previously given the assessment" do
    result = described_class.call!(campaigns_user, report)

    expect(result[:users_campaigns_assessments].first.users_result_id).to eq(nil)
  end
end
