# frozen_string_literal: true

require 'rails_helper'

describe Communications::WorkshopInviteReminderJob, type: :job do
  let(:campaign) { create(:campaign) }
  let(:assessment_group) { create(:campaign_assessment_group, campaign: campaign, group_type: 1) }
  let(:project) { campaign.project }
  let(:campaign_user) { create(:campaign_user, campaign: campaign) }
  let(:user) { campaign_user.user }
  let!(:communication) do
    create(:communication, kind: :workshop_invite_reminder, delivery_interval_number: 1,
      campaign_assessment_group: assessment_group,
      delivery_interval_period: 'days', campaign_id: campaign.id, project_id: project.id, client_id: project.parent.id)
  end

  before do
    Timecop.return
  end

  it 'creates communication_email if current time is less than workshop start time minus
    scheduling_lead_time minus 8 hours for matching assessment group' do
    workshop_invite, = create_workshop__with_invite(1.day.from_now + 8.1.hours)
    described_class.perform_now(communication)

    communication_email = CommunicationEmail.find_by(
      campaign_user: campaign_user, workshop_invite: workshop_invite
    )
    expect(communication_email).to be_present
    expect(workshop_invite.campaign_assessment_group).to eq(assessment_group)
  end

  it 'should creates only one communication_email per invited_subject' do
    workshop_invite, = create_workshop__with_invite(1.day.from_now + 8.1.hours)
    workshop2 = create(:workshop, start_time: 2.days.from_now + 8.1.hours,
                       campaign: campaign, scheduling_lead_time: 1.day)
    workshop_invite.workshops << workshop2

    described_class.perform_now(communication)

    communication_emails = CommunicationEmail.where(
      campaign_user: campaign_user, workshop_invite: workshop_invite
    )

    expect(communication_emails.count).to eq(1)
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
    workshop start time minus scheduling_lead_time minus 8 hours" do
    workshop_invite, = create_workshop__with_invite(1.day.from_now + 7.hours)
    described_class.perform_now(communication)

    communication_email = CommunicationEmail.find_by(
      campaign_user: campaign_user, workshop_invite: workshop_invite
    )
    expect(communication_email).to eq(nil)
  end

  it "doesn't create communication_email for workshop invites from different assessment groups" do
    # Create a workshop invite with a different assessment group
    other_assessment_group = create(:campaign_assessment_group, campaign: campaign, group_type: 1)
    workshop = create(:workshop, start_time: 1.day.from_now + 8.1.hours,
                     campaign: campaign, scheduling_lead_time: 1.day)
    workshop_invite = create(:workshop_invite, workshops: [workshop], campaign: campaign,
                           campaign_assessment_group: other_assessment_group)
    create(:workshop_invited_subject, workshop_invite: workshop_invite, user: user, status: :pending)

    described_class.perform_now(communication)

    communication_email = CommunicationEmail.find_by(
      campaign_user: campaign_user, workshop_invite: workshop_invite
    )
    expect(communication_email).to eq(nil)
  end

  it "doesn't create communication_email if campaign_user is removed (nil)" do
    workshop_invite, _workshop_invited_subject = create_workshop__with_invite(1.day.from_now + 8.1.hours)

    allow_any_instance_of(WorkshopInvitedSubject).to receive(:campaign_user).and_return(nil)

    described_class.perform_now(communication)

    communication_email = CommunicationEmail.find_by(
      campaign_user: campaign_user, workshop_invite: workshop_invite
    )
    expect(communication_email).to eq(nil)
  end

  it "doesn't create communication_email if campaign_user is inactive" do
    workshop_invite, = create_workshop__with_invite(1.day.from_now + 8.1.hours)

    campaign_user.update!(active: false)

    described_class.perform_now(communication)

    communication_email = CommunicationEmail.find_by(
      campaign_user: campaign_user, workshop_invite: workshop_invite
    )
    expect(communication_email).to eq(nil)
  end

  def create_workshop__with_invite(start_time)
    workshop = create(:workshop, start_time: start_time, campaign: campaign, scheduling_lead_time: 1.day)
    workshop_invite = create(:workshop_invite, workshops: [workshop], campaign: campaign,
campaign_assessment_group: assessment_group)
    workshop_invited_subject = create(
      :workshop_invited_subject, workshop_invite: workshop_invite, user: user, status: :pending
    )
    [workshop_invite, workshop_invited_subject]
  end
end
