# frozen_string_literal: true

require 'rails_helper'

describe Communications::WorkshopUpcomingReminderJob, type: :job do
  let(:campaign) { create(:campaign) }
  let(:project) { campaign.project }
  let(:campaign_user) { create(:campaign_user, campaign: campaign) }
  let(:user) { campaign_user.user }
  let!(:communication) do
    create(:communication, kind: :workshop_upcoming_reminder,
      campaign_id: campaign.id, project_id: project.id, client_id: project.parent.id)
  end

  it 'creates communication_email for workshop_subject 2 day before workshop starts' do
    workshop, workshop_invite = create_workshop__with_subject(2.days.from_now)
    described_class.perform_now

    communication_email = CommunicationEmail.find_by(
      campaign_user: campaign_user, workshop: workshop, workshop_invite: workshop_invite
    )
    expect(communication_email).to be_present
  end

  it 'creates communication_email for workshop_subject 1 day before workshop starts' do
    workshop, workshop_invite = create_workshop__with_subject(1.day.from_now)
    described_class.perform_now

    communication_email = CommunicationEmail.find_by(
      campaign_user: campaign_user, workshop: workshop, workshop_invite: workshop_invite
    )
    expect(communication_email).to be_present
  end

  it "doesn't create communication_email for workshop_subject 3 day before workshop starts" do
    workshop, workshop_invite = create_workshop__with_subject(3.days.ago)
    described_class.perform_now

    communication_email = CommunicationEmail.find_by(
      campaign_user: campaign_user, workshop: workshop, workshop_invite: workshop_invite
    )
    expect(communication_email).to eq(nil)
  end

  it "doesn't create communication_email for workshop_subject if workshop is on current day" do
    workshop, workshop_invite = create_workshop__with_subject(1.hour.from_now)
    described_class.perform_now

    communication_email = CommunicationEmail.find_by(
      campaign_user: campaign_user, workshop: workshop, workshop_invite: workshop_invite
    )
    expect(communication_email).to eq(nil)
  end

  it "doesn't create communication_email for workshop_subject if workshop is was in past" do
    workshop, workshop_invite = create_workshop__with_subject(1.day.ago)
    described_class.perform_now

    communication_email = CommunicationEmail.find_by(
      campaign_user: campaign_user, workshop: workshop, workshop_invite: workshop_invite
    )
    expect(communication_email).to eq(nil)
  end

  it "doesn't create communication_email if workshop is closed" do
    workshop, workshop_invite = create_workshop__with_subject(2.days.from_now)
    workshop.closed!
    described_class.perform_now

    communication_email = CommunicationEmail.find_by(
      campaign_user: campaign_user, workshop: workshop, workshop_invite: workshop_invite
    )
    expect(communication_email).to eq(nil)
  end

  it 'create communication_email if invite was accepted' do
    workshop, workshop_invite, _, invited_subject = create_workshop__with_subject(2.days.from_now)
    invited_subject.accepted!
    described_class.perform_now

    communication_email = CommunicationEmail.find_by(
      campaign_user: campaign_user, workshop: workshop, workshop_invite: workshop_invite
    )
    expect(communication_email).to be_present
  end

  it "doesn't create communication_email if invite was canceled" do
    workshop, workshop_invite, _, invited_subject = create_workshop__with_subject(2.days.from_now)
    invited_subject.cancelled!
    described_class.perform_now

    communication_email = CommunicationEmail.find_by(
      campaign_user: campaign_user, workshop: workshop, workshop_invite: workshop_invite
    )
    expect(communication_email).to eq(nil)
  end

  it "doesn't create communication_email if invite is accepted but workshop is cancelled" do
    workshop, workshop_invite, workshop_subject, invited_subject = create_workshop__with_subject(2.days.from_now)
    invited_subject.accepted!
    workshop_subject.cancelled!
    described_class.perform_now

    communication_email = CommunicationEmail.find_by(
      campaign_user: campaign_user, workshop: workshop, workshop_invite: workshop_invite
    )
    expect(communication_email).to eq(nil)
  end

  def create_workshop__with_subject(start_time)
    workshop = create(:workshop, start_time: start_time, campaign: campaign, status: :open)
    workshop_invite = create(:workshop_invite, workshops: [workshop], campaign: campaign)
    workshop_invited_subject = create(
      :workshop_invited_subject, workshop_invite: workshop_invite, user: user, status: :accepted
    )
    workshop_subject = create(:workshop_subject, workshop: workshop, user: user,
      campaign: campaign, workshop_invited_subject: workshop_invited_subject)
    [workshop, workshop_invite, workshop_subject, workshop_invited_subject]
  end
end
