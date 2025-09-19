# frozen_string_literal: true

require 'rails_helper'

describe CampaignUsers::GetExistingUserResult do
  let(:current_user) { create(:user) }
  let(:campaign_user) { create(:campaign_user) }
  let(:campaign) { campaign_user.campaign }
  let(:user) { campaign_user.user }
  let(:assessment) { create(:assessment) }
  let!(:old_hogan_credential) { create(:hogan_credential, user: user) }
  let!(:hogan_credential) { create(:hogan_credential, user: user) }
  let(:project) { create(:project) }
  let!(:project_assessment) do
    create(:project_assessment, assessment: assessment, project: project, user_result_validity_in_days: 30)
  end
  let(:participant_profile) do
    { 'assessmentDetails' => [{ 'assessmentId' => '1', 'formId' => '2', 'status' => 'Completed' }] }
  end

  before(:each) do
    allow(Licenses::Use).to receive(:call!)
  end

  it 'returns the users_result within the validity period' do
    user_assessment = create(:user_assessment, assessment: assessment, subject: user, evaluator: user,
completed_at: 10.days.ago)
    users_result = create(:users_result, user_assessment: user_assessment)

    result = described_class.call!(campaign_user, assessment, project.id)

    expect(result).to eq(users_result)
  end

  it 'returns the users_result within the default validity period' do
    project_assessment.destroy
    user_assessment = create(:user_assessment, assessment: assessment, subject: user, evaluator: user,
completed_at: 179.days.ago)
    users_result = create(:users_result, user_assessment: user_assessment)

    result = described_class.call!(campaign_user, assessment, project.id)

    expect(result).to eq(users_result)
  end

  it 'returns nil if no users_result is found within the validity period' do
    user_assessment = create(:user_assessment, assessment: assessment, subject: user, evaluator: user,
completed_at: 40.days.ago)
    create(:users_result, user_assessment: user_assessment)

    result = described_class.call!(campaign_user, assessment, project.id)

    expect(result).to be_nil
  end

  it 'returns the users_result if completed_at is nil' do
    user_assessment = create(:user_assessment, assessment: assessment, subject: user, evaluator: user,
completed_at: nil)
    users_result = create(:users_result, user_assessment: user_assessment)

    result = described_class.call!(campaign_user, assessment, project.id)

    expect(result).to eq(users_result)
  end

  it 'filters users_result by hogan credential if assessment is hogan' do
    assessment.update!(type: 'Assessments::Hogan')
    user_assessment = create(:user_assessment, assessment: assessment, subject: user, evaluator: user,
completed_at: 600.days.ago)
    users_result = create(:users_result, user_assessment: user_assessment)
    create(:resource_hogan_credential, resource: user_assessment, hogan_credential: hogan_credential)

    result = described_class.call!(campaign_user, assessment, project.id)

    expect(result).to eq(users_result)
  end

  it 'returns nil if no users_result is found in hogan' do
    allow(Services::Hogan::Api::Json::GetParticipantProfile).to receive(:call!).and_return(participant_profile)

    answers = { '1' => [{ 'value' => 10 }] }
    existing_user_result = create(
      :users_result,
      evaluator: campaign_user.user,
      assessment_id: assessment.id,
      answers: answers
    )

    assessment.update!(type: 'Assessments::Hogan')
    create(:resource_hogan_credential, resource: existing_user_result.user_assessment,
hogan_credential: old_hogan_credential)

    result = described_class.call!(campaign_user, assessment, project.id)

    expect(result).to be_nil
  end

  it 'returns an empty relation if no existing hogan credential is found' do
    assessment.update!(type: 'Assessments::Hogan')
    hogan_credential.destroy

    result = described_class.call!(campaign_user, assessment, project.id)

    expect(result).to be_nil
  end

  it 'prioritizes completed assessment over more recent in-progress assessment' do
    completed_user_assessment = create(:user_assessment,
                                       assessment: assessment,
                                       subject: user,
                                       evaluator: user,
                                       status: :completed,
                                       completed_at: 20.days.ago,
                                       created_at: 25.days.ago)
    completed_users_result = create(:users_result, created_at: 25.days.ago, user_assessment: completed_user_assessment)

    in_progress_user_assessment = create(:user_assessment,
                                         assessment: assessment,
                                         subject: user,
                                         evaluator: user,
                                         status: :in_progress,
                                         completed_at: nil,
                                         created_at: 10.days.ago)
    create(:users_result, created_at: 10.days.ago, user_assessment: in_progress_user_assessment)

    result = described_class.call!(campaign_user, assessment, project.id)

    expect(result).to eq(completed_users_result)
  end

  it 'returns latest completed assessment when multiple completed assessments exist' do
    older_completed_assessment = create(:user_assessment,
                                        assessment: assessment,
                                        subject: user,
                                        evaluator: user,
                                        status: :completed,
                                        completed_at: 30.days.ago,
                                        created_at: 35.days.ago)
    create(:users_result, user_assessment: older_completed_assessment)

    newer_completed_assessment = create(:user_assessment,
                                        assessment: assessment,
                                        subject: user,
                                        evaluator: user,
                                        status: :completed,
                                        completed_at: 15.days.ago,
                                        created_at: 20.days.ago)
    newer_completed_users_result = create(:users_result, user_assessment: newer_completed_assessment)

    result = described_class.call!(campaign_user, assessment, project.id)

    expect(result).to eq(newer_completed_users_result)
  end
end
