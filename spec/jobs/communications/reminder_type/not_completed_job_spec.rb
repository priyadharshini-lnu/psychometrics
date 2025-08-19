# frozen_string_literal: true

require 'rails_helper'

describe Communications::ReminderType::NotCompletedJob, type: :job do
  let(:campaign) { create(:campaign) }

  let(:project) { campaign.project }
  let!(:campaign_user1) { create(:campaign_user, campaign: campaign, completion_status: :in_progress) }
  let!(:campaign_user2) { create(:campaign_user, campaign: campaign, completion_status: :in_progress) }

  let!(:communication) do
    create(:communication, kind: :reminder, delivery_interval_number: '1', delivery_interval_period: 'days',
      campaign_id: campaign.id, project_id: project.id, client_id: project.parent.id)
  end

  let!(:invitation_communication) do
    create(:communication, kind: :invitation,
      campaign_id: campaign.id, project_id: project.id, client_id: project.parent.id)
  end

  it 'creates reminder communication email for users who completion_status not completed' do
    expect do
      described_class.perform_now(communication)
    end.to change(CommunicationEmail, :count).by(2)

    campaign_user2.update(completion_status: :completed)

    expect do
      described_class.perform_now(communication)
    end.to change(CommunicationEmail, :count).by(1)
  end

  it 'creates reminder communication email for users who have not been invited in the last 24 hours' do
    create(:communication_email, sent_at: 20.hours.ago, campaign_user: campaign_user2,
communication: invitation_communication)

    create(:communication_email, sent_at: 20.hours.ago, campaign_user: campaign_user2,
          communication: communication)

    expect do
      described_class.perform_now(communication)
    end.to change(CommunicationEmail, :count).by(1)

    new_emails = communication.emails.where(sent_at: nil)

    expect(new_emails.map(&:campaign_user_id)).to include(campaign_user1.id)
    expect(new_emails.map(&:campaign_user_id)).not_to include(campaign_user2.id)
  end

  it 'schedules the next job with the correct delay' do
    allow(communication).to receive_message_chain(:send_email_job, :set, :perform_later)

    described_class.perform_now(communication)

    expect(communication.send_email_job.set(wait: communication.delivery_interval_duration)).
      to have_received(:perform_later).with(communication)
  end

  context 'when selected assessments are present' do
    let!(:assessment1) { create(:assessment) }
    let!(:assessment2) { create(:assessment) }
    let!(:assessment3) { create(:assessment) }

    let!(:communication_with_selected_assessments) do
      comm = create(:communication, kind: :reminder, delivery_interval_number: '1', delivery_interval_period: 'days',
        campaign_id: campaign.id, project_id: project.id, client_id: project.parent.id)

      create(:communications_assessment, communication: comm, assessment: assessment1)
      create(:communications_assessment, communication: comm, assessment: assessment2)

      comm
    end

    let!(:user_assessment1_complete) do
      create(:user_assessment, subject: campaign_user1.user, evaluator: campaign_user1.user,
             campaign: campaign, assessment: assessment1, status: :completed)
    end

    let!(:user_assessment2_incomplete) do
      create(:user_assessment, subject: campaign_user1.user, evaluator: campaign_user1.user,
             campaign: campaign, assessment: assessment2, status: :in_progress)
    end

    let!(:user_assessment1_complete_user2) do
      create(:user_assessment, subject: campaign_user2.user, evaluator: campaign_user2.user,
             campaign: campaign, assessment: assessment1, status: :completed)
    end

    let!(:user_assessment2_complete_user2) do
      create(:user_assessment, subject: campaign_user2.user, evaluator: campaign_user2.user,
             campaign: campaign, assessment: assessment2, status: :completed)
    end

    it 'creates reminder emails only for users who have not completed all selected assessments' do
      expect do
        described_class.perform_now(communication_with_selected_assessments)
      end.to change(CommunicationEmail, :count).by(1)

      new_emails = communication_with_selected_assessments.emails

      expect(new_emails.map(&:campaign_user_id)).to include(campaign_user1.id)
      expect(new_emails.map(&:campaign_user_id)).not_to include(campaign_user2.id)
    end

    it 'excludes users who completed all selected assessments even if completion_status is not completed' do
      campaign_user1.update(completion_status: :in_progress)
      campaign_user2.update(completion_status: :in_progress)

      user_assessment2_incomplete.update(status: :completed)

      expect do
        described_class.perform_now(communication_with_selected_assessments)
      end.to change(CommunicationEmail, :count).by(0)

      new_emails = communication_with_selected_assessments.emails
      expect(new_emails).to be_empty
    end
  end
end
