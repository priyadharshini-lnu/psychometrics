# frozen_string_literal: true

require 'rails_helper'

describe Hogan::HandleAssessmentCompletion do
  let(:assessment) { create(:hogan_assessment) }
  let(:report) { create(:report, :hogan, assessments: [assessment]) }
  let(:user) { create(:user, hogan_credential: build(:hogan_credential)) }
  let(:project) { create(:project) }
  let!(:users_result) { create(:users_result, without_user_assessment: true) }
  let(:user_assessment) do
    create(:user_assessment, assessment: assessment, users_result: users_result, status: :completed,
score_calculated: true)
  end
  let!(:user_report) do
    create(:user_report,
           campaign_id: user_assessment.campaign_id,
            report_id: report.id,
             user_id: users_result.subject_id, external_added: true)
  end

  it "doesn't call SaveReportsAndScoresJob if external_result and report pdf is present " do
    allow_any_instance_of(UserReport).to receive(:pdf?).and_return(true)
    users_result.update!(external_results: { some_result: {} })
    expect(Hogan::SaveReportsAndScoresJob).to_not receive(:set)

    described_class.call(user_assessment)
  end

  it "doesn't call SaveReportsAndScoresJob if assessment is not completed" do
    user_assessment.update!(status: :in_progress)
    expect(Hogan::SaveReportsAndScoresJob).to_not receive(:set)

    described_class.call(user_assessment)
  end

  it 'calls SaveReportsAndScoresJob when external score is not present and there is report pdf' do
    allow_any_instance_of(UserReport).to receive(:pdf?).and_return(true)
    expect(Hogan::SaveReportsAndScoresJob).to receive(:set).with(wait: 1.minute).and_return(
      double('job', perform_later: true)
    )

    described_class.call(user_assessment)
  end

  it 'calls SaveReportsAndScoresJob when external score is present but there is no report pdf' do
    allow_any_instance_of(UserReport).to receive(:pdf?).and_return(false)
    users_result.update!(external_results: { some_result: {} })
    expect(Hogan::SaveReportsAndScoresJob).to receive(:set).with(wait: 1.minute).and_return(
      double('job', perform_later: true)
    )

    described_class.call(user_assessment)
  end
end
