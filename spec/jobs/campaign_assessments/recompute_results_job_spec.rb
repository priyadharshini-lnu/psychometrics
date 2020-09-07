# frozen_string_literal: true

require 'rails_helper'

describe CampaignAssessments::RecomputeResultsJob do
  let(:current_user) { create(:superadmin) }
  let(:norm) { create(:norm) }
  let(:campaign_assessment) { create(:campaign_assessment, norm: norm, norm_type: 'ETI') }
  let!(:report) { create(:report, assessments: [campaign_assessment.assessment]) }

  let(:completed_user_assessment) do
    create(:user_assessment, assessment: campaign_assessment.assessment, campaign: campaign_assessment.campaign)
  end
  let!(:completed_user_result) do
    create(:users_result,
           status: :completed,
           assessment: campaign_assessment.assessment,
           user_assessments: [completed_user_assessment])
  end

  let(:uncompleted_user_assessment) do
    create(:user_assessment, assessment: campaign_assessment.assessment, campaign: campaign_assessment.campaign)
  end

  let!(:uncompleted_user_result) do
    create(:users_result,
           status: :in_progress,
           assessment: campaign_assessment.assessment,
           user_assessments: [uncompleted_user_assessment])
  end

  let!(:prepared_user_report) do
    create(:user_report,
           status: :prepared,
           report: report,
           campaign: campaign_assessment.campaign)
  end

  it do
    expect(::UsersResults::Recompute).to receive(:call!).
      with(completed_user_result, current_user, 'id' => norm.id, 'type' => 'ETI')
    expect(::UsersResults::Recompute).to_not receive(:call!).
      with(uncompleted_user_result, current_user, 'id' => norm.id, 'type' => 'ETI')

    CampaignAssessments::RecomputeResultsJob.perform_now(campaign_assessment, current_user)
  end
end
