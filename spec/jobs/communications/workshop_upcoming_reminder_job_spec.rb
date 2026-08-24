# frozen_string_literal: true

require 'rails_helper'

describe Communications::WorkshopUpcomingReminderJob, type: :job do
  let(:campaign) { create(:campaign) }
  let(:assessment_group) { create(:campaign_assessment_group, campaign: campaign, group_type: 1) }
  let(:project) { campaign.project }
  let(:campaign_user) { create(:campaign_user, campaign: campaign) }
  let(:user) { campaign_user.user }
  let!(:communication) do
    create(:communication, kind: :workshop_upcoming_reminder,
      campaign_assessment_group: assessment_group,
      campaign_id: campaign.id, project_id: project.id, client_id: project.parent.id)
  end

  it 'creates communication_email for workshop_subject from same assessment group 2 day before workshop starts' do
    workshop, = create_workshop__with_subject(2.days.from_now)
    described_class.perform_now

    communication_email = CommunicationEmail.find_by(campaign_user: campaign_user, workshop: workshop)
    expect(communication_email).to be_present
  end

  it 'creates communication_email for workshop_subject 2 day before workshop starts' do
    workshop, = create_workshop__with_subject(2.days.from_now)
    described_class.perform_now

    communication_email = CommunicationEmail.find_by(campaign_user: campaign_user, workshop: workshop)
    expect(communication_email).to be_present
  end

  it 'creates communication_email for workshop_subject 1 day before workshop starts' do
    workshop, = create_workshop__with_subject(1.day.from_now)
    described_class.perform_now

    communication_email = CommunicationEmail.find_by(campaign_user: campaign_user, workshop: workshop)
    expect(communication_email).to be_present
  end

  it "doesn't create communication_email for workshop_subject 3 day before workshop starts" do
    workshop, = create_workshop__with_subject(3.days.ago)
    described_class.perform_now

    communication_email = CommunicationEmail.find_by(campaign_user: campaign_user, workshop: workshop)
    expect(communication_email).to eq(nil)
  end

  it "doesn't create communication_email for workshop_subject if workshop is on current day" do
    workshop, = create_workshop__with_subject(1.hour.from_now)
    described_class.perform_now

    communication_email = CommunicationEmail.find_by(
      campaign_user: campaign_user, workshop: workshop
    )
    expect(communication_email).to eq(nil)
  end

  it "doesn't create communication_email for workshop_subject if workshop is was in past" do
    workshop, = create_workshop__with_subject(1.day.ago)
    described_class.perform_now

    communication_email = CommunicationEmail.find_by(
      campaign_user: campaign_user, workshop: workshop
    )
    expect(communication_email).to eq(nil)
  end

  it "doesn't create communication_email if workshop is closed" do
    workshop, = create_workshop__with_subject(2.days.from_now)
    workshop.closed!
    described_class.perform_now

    communication_email = CommunicationEmail.find_by(
      campaign_user: campaign_user, workshop: workshop
    )
    expect(communication_email).to eq(nil)
  end

  it 'create communication_email if invite was accepted' do
    workshop, = create_workshop__with_subject(2.days.from_now)
    described_class.perform_now

    communication_email = CommunicationEmail.find_by(campaign_user: campaign_user, workshop: workshop)
    expect(communication_email).to be_present
  end

  it "doesn't create communication_email if but workshop is cancelled" do
    workshop, workshop_subject = create_workshop__with_subject(2.days.from_now)
    workshop_subject.cancelled!
    described_class.perform_now

    communication_email = CommunicationEmail.find_by(campaign_user: campaign_user, workshop: workshop)
    expect(communication_email).to eq(nil)
  end

  it "doesn't create communication_email if invite is accepted but workshop is cancelled" do
    workshop, workshop_subject = create_workshop__with_subject(2.days.from_now)
    workshop_subject.cancelled!
    described_class.perform_now

    communication_email = CommunicationEmail.find_by(campaign_user: campaign_user, workshop: workshop)
    expect(communication_email).to eq(nil)
  end

  it 'does not create communication_email for workshop_subject from different assessment group' do
    other_assessment_group = create(:campaign_assessment_group, campaign: campaign, group_type: 1)
    workshop = create(:workshop, start_time: 2.days.from_now, campaign: campaign, status: :open,
campaign_assessment_group: other_assessment_group)
    workshop_invite = create(:workshop_invite, workshops: [workshop], campaign: campaign,
                           campaign_assessment_group: other_assessment_group)
    create(:workshop_subject, workshop: workshop, user: user, campaign: campaign,
           workshop_invite: workshop_invite, scheduling_status: :scheduled)

    described_class.perform_now

    communication_email = CommunicationEmail.find_by(campaign_user: campaign_user, workshop: workshop)
    expect(communication_email).to be_nil
  end

  context 'when an active CommunicationDelivery exists for the matching assessment group' do
    let!(:delivery) do
      create(:communication_delivery, :workshop_upcoming_reminder, client: project.parent, project: project,
                                                                       campaign: campaign,
                                                                       campaign_assessment_group: assessment_group)
    end

    context 'and use_new_communication_center is disabled for the client (default)' do
      it 'sends the legacy email only -- the delivery is not usable without the flag' do
        workshop, = create_workshop__with_subject(2.days.from_now)
        described_class.perform_now

        expect(CommunicationEmail.where(communication_delivery: delivery, workshop: workshop)).to be_empty
        expect(CommunicationEmail.find_by(campaign_user: campaign_user, workshop: workshop)).to be_present
      end
    end

    context 'and use_new_communication_center is enabled for the client' do
      before { project.parent.client_feature.update!(use_new_communication_center: true) }

      it 'sends the delivery-sourced email only -- the flag suppresses the legacy send' do
        workshop, = create_workshop__with_subject(2.days.from_now)
        described_class.perform_now

        delivery_email = CommunicationEmail.find_by(communication_delivery: delivery, campaign_user: campaign_user,
                                                    workshop: workshop)
        expect(delivery_email).to be_present
        expect(communication.reload.emails).to be_empty
      end

      it 'does not create a delivery-sourced email for a workshop_subject in a different assessment group' do
        other_assessment_group = create(:campaign_assessment_group, campaign: campaign, group_type: 1)
        workshop = create(:workshop, start_time: 2.days.from_now, campaign: campaign, status: :open,
campaign_assessment_group: other_assessment_group)
        workshop_invite = create(:workshop_invite, workshops: [workshop], campaign: campaign,
                               campaign_assessment_group: other_assessment_group)
        create(:workshop_subject, workshop: workshop, user: user, campaign: campaign,
               workshop_invite: workshop_invite, scheduling_status: :scheduled)

        described_class.perform_now

        expect(CommunicationEmail.where(communication_delivery: delivery, workshop: workshop)).to be_empty
      end
    end
  end

  def create_workshop__with_subject(start_time)
    workshop = create(:workshop, start_time: start_time, campaign: campaign, status: :open,
campaign_assessment_group: assessment_group)
    workshop_invite = create(:workshop_invite, workshops: [workshop], campaign: campaign,
                           campaign_assessment_group: assessment_group)
    workshop_subject = create(:workshop_subject, workshop: workshop, user: user, campaign: campaign,
                            workshop_invite: workshop_invite, scheduling_status: :scheduled)
    [workshop, workshop_subject]
  end
end
