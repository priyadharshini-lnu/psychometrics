# frozen_string_literal: true

require 'rails_helper'

describe Communications::NewAssignmentJob, type: :job do
  let(:campaign) { create(:campaign) }
  let(:campaign_user) { create(:campaign_user, campaign: campaign, active: true) }
  let(:user) { campaign_user.user }

  it 'creates communication_email for user with new assessment if new assignment communication
    is present for the campaign' do
    communication = create(:communication, recipients: :new_assignment, project_campaign: campaign,
      project_id: campaign.project_id, last_ran_at: 5.minutes.ago)
    user_without_new_assignment = create(:campaign_user, campaign: campaign).user
    create(:user_assessment, subject: user_without_new_assignment, evaluator: user_without_new_assignment,
      campaign: campaign, created_at: 20.minutes.ago)
    create(:user_assessment, subject: user, evaluator: user, campaign: campaign, created_at: 1.minute.ago)

    expect do
      described_class.perform_now
    end.to change(CommunicationEmail, :count).by(1)

    expect(communication.reload.emails.first.campaign_user_id).to eq(campaign_user.id)
  end

  it 'updates last_ran_at for communication' do
    communication = create(:communication, recipients: :new_assignment, project_campaign: campaign,
      project_id: campaign.project_id, last_ran_at: 5.minutes.ago)
    create(:user_assessment, subject: user, evaluator: user, campaign: campaign, created_at: 1.minute.ago)
    described_class.perform_now

    expect(communication.reload.last_ran_at).to be_within(2.seconds).of Time.zone.now
  end

  it 'creates only one communication_email even if multiple assessment is added to a user' do
    create(:communication, recipients: :new_assignment, project_campaign: campaign,
      project_id: campaign.project_id, last_ran_at: 5.minutes.ago)
    create(:user_assessment, subject: user, evaluator: user, campaign: campaign, created_at: 1.minute.ago)
    create(:user_assessment, subject: user, evaluator: user, campaign: campaign, created_at: 1.minute.ago)

    expect do
      described_class.perform_now
    end.to change(CommunicationEmail, :count).by(1)
  end

  it "doesn't creates communication_email for user with new assessment if new assignment communication
      is not present for the campaign" do
    new_campaign = create(:campaign)
    create(:communication, recipients: :new_assignment, project_campaign: new_campaign,
        project_id: new_campaign.project_id, last_ran_at: 5.minutes.ago)
    create(:user_assessment, subject: user, evaluator: user, campaign: campaign, created_at: 1.minute.ago)
    expect do
      described_class.perform_now
    end.to_not change(CommunicationEmail, :count)
  end

  it "doesn't create communication_email for inactive campaign users" do
    create(:communication, recipients: :new_assignment, project_campaign: campaign,
      project_id: campaign.project_id, last_ran_at: 5.minutes.ago)
    inactive_campaign_user = create(:campaign_user, campaign: campaign, active: false)
    create(:user_assessment, subject: inactive_campaign_user.user, evaluator: inactive_campaign_user.user,
      campaign: campaign, created_at: 1.minute.ago)

    expect do
      described_class.perform_now
    end.to_not change(CommunicationEmail, :count)
  end
end
