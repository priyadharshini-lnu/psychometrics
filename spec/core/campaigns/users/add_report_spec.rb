# frozen_string_literal: true

require 'rails_helper'

describe Campaigns::Users::AddReport do
  let(:campaign_user) { create(:campaign_user) }
  let(:report) { create(:report, assessments: [create(:assessment)]) }

  it 'adds UserReport if not already added' do
    expect do
      described_class.call!(campaign_user, report, assessments: report.assessments)
    end.to change { UserReport.count }.by(1)
  end

  it "doesn't adds UserReport if it is already added" do
    create(:user_report, report: report, campaign: campaign_user.campaign, user: campaign_user.user)
    expect { described_class.call!(campaign_user, report, assessments: report.assessments) }.
      to_not(change { UserReport.count })
  end

  it 'adds UserAssessment for each report if not present' do
    expect do
      described_class.call!(campaign_user, report, assessments: report.assessments)
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
      described_class.call!(campaign_user, report, assessments: report.assessments)
    end.to_not(change { UserAssessment.count })
  end

  it 'calls UserReports::GenerateAndSavePdfJob' do
    create(
      :user_assessment,
      assessment_id: report.assessments.first.id,
      campaign: campaign_user.campaign,
      subject: campaign_user.user,
      evaluator: campaign_user.user,
      relationship: Relationship.self_relationship
    )
    expect(UserReports::GenerateAndSavePdfJob).to receive(:perform_later)

    described_class.call!(campaign_user, report, assessments: report.assessments)
  end

  it 'copies users_result if user have previously given the assessment and add_and_allow_new_response is not set' do
    answers = { '1' => [{ 'value' => 10 }] }
    existing_user_result = create(
      :users_result,
      evaluator: campaign_user.user,
      assessment_id: report.assessments.first.id,
      answers: answers
    )
    output = described_class.call!(campaign_user, report, assessments: report.assessments)
    new_user_result = output[:user_assessments].first.users_result

    expect(new_user_result).to_not eq(existing_user_result)
    expect(new_user_result.answers).to eq(answers)
  end

  it "create new user_result record if operation is set to 'add_and_allow_new_response'" do
    existing_user_result = create(:users_result,
                                  evaluator: campaign_user.user, assessment_id: report.assessments.first.id)
    result = described_class.call!(
      campaign_user, report, operation: 'add_and_allow_new_response', assessments: report.assessments
    )

    expect(result[:user_assessments].first.users_result_id).to_not eq(existing_user_result.id)
  end

  it 'create new user_result if user have not previously given the assessment' do
    result = described_class.call!(campaign_user, report, assessments: report.assessments)

    expect(result[:user_assessments].first.users_result).to be_present
  end
end
