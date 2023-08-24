# frozen_string_literal: true

require 'rails_helper'

describe Communications::WorkshopInviteReminderJob, type: :job do
  let(:campaign) { create(:campaign) }
  let(:project) { campaign.project }
  let(:campaign_user) { create(:campaign_user, campaign: campaign) }
  let(:user) { campaign_user.user }
  let!(:communication) do
    create(:communication, kind: :workshop_invite_reminder, delivery_interval_number: 1,
      delivery_interval_period: 'days', campaign_id: campaign.id, project_id: project.id, client_id: project.parent.id)
  end

  before do
    Timecop.return
  end

  it 'creates communication_email if current time is less than workshop start time minus
    reschedule_lead_time minus 8 hours' do
    workshop_invite, = create_workshop__with_invite(1.day.from_now + 8.1.hours)
    described_class.perform_now(communication)

    communication_email = CommunicationEmail.find_by(
      campaign_user: campaign_user, workshop_invite: workshop_invite
    )
    expect(communication_email).to be_present
  end

  it "doesn't create communication_email if invite is not pending" do
    workshop_invite, workshop_invited_subject = create_workshop__with_invite(1.day.from_now + 8.1.hours)
    workshop_invited_subject.update!(status: :accepted)
    described_class.perform_now(communication)

    communication_email = CommunicationEmail.find_by(
      campaign_user: campaign_user, workshop_invite: workshop_invite
    )
    expect(communication_email).to eq(nil)
  end

  it "doesn't create communication_email if current time is more than
    workshop start time minus reschedule_lead_time minus 8 hours" do
    workshop_invite, = create_workshop__with_invite(1.day.from_now + 7.hours)
    described_class.perform_now(communication)

    communication_email = CommunicationEmail.find_by(
      campaign_user: campaign_user, workshop_invite: workshop_invite
    )
    expect(communication_email).to eq(nil)
  end

  def create_workshop__with_invite(start_time)
    workshop = create(:workshop, start_time: start_time, campaign: campaign, reschedule_lead_time: 1.day)
    workshop_invite = create(:workshop_invite, workshops: [workshop], campaign: campaign)
    workshop_invited_subject = create(
      :workshop_invited_subject, workshop_invite: workshop_invite, user: user, status: :pending
    )
    [workshop_invite, workshop_invited_subject]
  end
end
