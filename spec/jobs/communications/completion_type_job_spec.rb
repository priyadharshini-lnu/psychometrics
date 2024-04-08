# frozen_string_literal: true

require 'rails_helper'

describe Communications::CompletionTypeJob, type: :job do
  let(:campaign) { create(:campaign) }
  let(:campaign_user) { create(:campaign_user, campaign: campaign) }
  let(:user) { campaign_user.user }

  it 'creates communication_email for when user_assessment is completed' do
    user = campaign_user.user
    user_assessment = create(:user_assessment, subject: user, evaluator: user, campaign: campaign)
    communication = create(:communication, kind: :completion, project_campaign: campaign,
      project_id: campaign.project_id, assessment_id: user_assessment.assessment.id)
    expect do
      described_class.perform_now(user_assessment)
    end.to change(CommunicationEmail, :count).by(1)

    expect(communication.reload.emails.first.campaign_user_id).to eq(campaign_user.id)
  end

  it 'create communication when assessment_completion_status_code matches' do
    user = campaign_user.user
    user_assessment = create(
      :user_assessment, subject: user, evaluator: user, campaign: campaign, completion_status_code: 'code_1'
    )
    communication = create(
      :communication, kind: :completion, project_campaign: campaign,
      project_id: campaign.project_id, assessment_id: user_assessment.assessment.id,
      assessment_completion_status_code: 'code_1'
    )
    expect do
      described_class.perform_now(user_assessment)
    end.to change(CommunicationEmail, :count).by(1)

    expect(communication.reload.emails.first.campaign_user_id).to eq(campaign_user.id)
  end

  it 'does not create communication when assessment_completion_status_code does not match' do
    user = campaign_user.user
    user_assessment = create(
      :user_assessment, subject: user, evaluator: user, campaign: campaign, completion_status_code: 'code_1'
    )
    create(
      :communication, kind: :completion, project_campaign: campaign,
      project_id: campaign.project_id, assessment_id: user_assessment.assessment.id,
      assessment_completion_status_code: 'code_2'
    )
    expect do
      described_class.perform_now(user_assessment)
    end.to_not change(CommunicationEmail, :count)
  end

  it 'schedules communication for future delivery if there is delivery delay' do
    user = campaign_user.user
    user_assessment = create(
      :user_assessment, subject: user, evaluator: user, campaign: campaign, completion_status_code: 'code_1'
    )
    create(
      :communication, kind: :completion, project_campaign: campaign,
      project_id: campaign.project_id, assessment_id: user_assessment.assessment.id,
      assessment_completion_status_code: 'code_1', delivery_delay_hours: 1
    )
    expect(Communications::ScheduleDelayedCommunication).to receive(:set).with(wait: 1.hour).and_call_original
    expect do
      described_class.perform_now(user_assessment)
    end.to_not change(CommunicationEmail, :count)
  end
end
