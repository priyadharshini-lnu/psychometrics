# frozen_string_literal: true

require 'rails_helper'

describe WorkshopSubject, type: :model do
  describe 'Callbacks' do
    context '#publish_scheduling_cancelled' do
      it 'publishes scheduling cancelled webhook event' do
        workshop_subject = create(:workshop_subject)
        webhook = WorkshopSubjects::Webhook.new(workshop_subject)
        expect(WebhookSubscriptions::Publish).to receive(:call).with(
          workshop_subject.campaign.project,
          :scheduling_cancelled,
          webhook.send(:scheduling_cancelled_data),
          record: workshop_subject,
          webhook_id: nil
        )
        workshop_subject.update(scheduling_status: :cancelled)
      end

      it 'does not publish scheduling cancelled webhook event if status is not cancelled' do
        workshop_subject = create(:workshop_subject)
        expect(WebhookSubscriptions::Publish).not_to receive(:call)
        workshop_subject.update(scheduling_status: :scheduled)
      end
    end
  end

  describe '#send_workshop_booked_email' do
    let(:campaign) { create(:campaign) }
    let(:assessment_group) { create(:campaign_assessment_group, campaign: campaign, group_type: 1) }
    let(:workshop) { create(:workshop, campaign: campaign, campaign_assessment_group: assessment_group) }
    let(:workshop_invite) do
      create(:workshop_invite, workshops: [workshop], campaign: campaign, campaign_assessment_group: assessment_group)
    end
    let(:user) { create(:user, project: campaign.project) }
    let(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }
    let!(:communication) do
      create(:communication,
             kind: :workshop_booked,
             campaign_assessment_group: assessment_group,
             campaign_id: campaign.id,
             project_id: campaign.project.id,
             client_id: campaign.project.parent.id)
    end

    context 'when workshop subject is created' do
      it 'sends workshop booked email for matching assessment group when created as scheduled' do
        expect do
          create(:workshop_subject,
                 workshop: workshop,
                 workshop_invite: workshop_invite,
                 campaign: campaign,
                 user: user)
        end.to change(communication.emails, :count).by(1)

        email = communication.emails.last
        expect(email.workshop).to eq(workshop)
        expect(email.workshop_invite).to eq(workshop_invite)
      end

      it 'does not send email for different assessment group' do
        other_assessment_group = create(:campaign_assessment_group, campaign: campaign, group_type: 1)
        workshop.update!(campaign_assessment_group: other_assessment_group)
        other_workshop_invite = create(:workshop_invite,
                                       workshops: [workshop],
                                       campaign: campaign,
                                       campaign_assessment_group: other_assessment_group)

        expect do
          create(:workshop_subject,
                 workshop: workshop,
                 workshop_invite: other_workshop_invite,
                 campaign: campaign,
                 user: user)
        end.not_to change(communication.emails, :count)
      end
    end

    context 'when workshop status is updated' do
      it 'does not send email when status is changed to scheduled' do
        workshop_subject = create(:workshop_subject,
                                  workshop: workshop,
                                  workshop_invite: workshop_invite,
                                  campaign: campaign,
                                  user: user,
                                  scheduling_status: :cancelled)

        expect do
          workshop_subject.update!(scheduling_status: :scheduled)
        end.not_to change(communication.emails, :count)
      end
    end

    context 'when communication is not set up' do
      it 'does not send email if workshop_booked communication is not present' do
        communication.destroy

        expect do
          create(:workshop_subject,
                 workshop: workshop,
                 workshop_invite: workshop_invite,
                 campaign: campaign,
                 user: user)
        end.not_to change(CommunicationEmail, :count)
      end
    end
  end

  describe '#send_workshop_cancelled_email' do
    let(:campaign) { create(:campaign) }
    let(:assessment_group) { create(:campaign_assessment_group, campaign: campaign, group_type: 1) }
    let(:workshop) { create(:workshop, campaign: campaign, campaign_assessment_group: assessment_group) }
    let(:workshop_invite) do
      create(:workshop_invite, workshops: [workshop], campaign: campaign, campaign_assessment_group: assessment_group)
    end
    let(:user) { create(:user, project: campaign.project) }
    let(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }
    let!(:communication) do
      create(:communication,
             kind: :workshop_cancelled,
             campaign_assessment_group: assessment_group,
             campaign_id: campaign.id,
             project_id: campaign.project.id,
             client_id: campaign.project.parent.id)
    end

    context 'when workshop status is updated to cancelled' do
      it 'sends workshop cancelled email for matching assessment group' do
        workshop_subject = create(:workshop_subject,
                                  workshop: workshop,
                                  workshop_invite: workshop_invite,
                                  campaign: campaign,
                                  user: user,
                                  scheduling_status: :scheduled)

        expect do
          workshop_subject.update!(scheduling_status: :cancelled)
        end.to change(communication.emails, :count).by(1)

        email = communication.emails.last
        expect(email.workshop).to eq(workshop)
        expect(email.workshop_invite).to eq(workshop_invite)
      end

      it 'sends workshop cancelled email when status is updated to late_cancelled' do
        workshop_subject = create(:workshop_subject,
                                  workshop: workshop,
                                  workshop_invite: workshop_invite,
                                  campaign: campaign,
                                  user: user,
                                  scheduling_status: :scheduled)

        expect do
          workshop_subject.update!(scheduling_status: :late_cancelled)
        end.to change(communication.emails, :count).by(1)
      end

      it 'does not send email for different assessment group' do
        other_assessment_group = create(:campaign_assessment_group, campaign: campaign, group_type: 0)
        workshop.update!(campaign_assessment_group: other_assessment_group)
        other_workshop_invite = create(:workshop_invite,
                                       workshops: [workshop],
                                       campaign: campaign,
                                       campaign_assessment_group: other_assessment_group)
        workshop_subject = create(:workshop_subject,
                                  workshop: workshop,
                                  workshop_invite: other_workshop_invite,
                                  campaign: campaign,
                                  user: user,
                                  scheduling_status: :scheduled)

        expect do
          workshop_subject.update!(scheduling_status: :cancelled)
        end.not_to change(communication.emails, :count)
      end
    end

    context 'when communication is not set up' do
      it 'does not send email if workshop_cancelled communication is not present' do
        workshop_subject = create(:workshop_subject,
                                  workshop: workshop,
                                  workshop_invite: workshop_invite,
                                  campaign: campaign,
                                  user: user,
                                  scheduling_status: :scheduled)

        communication.destroy

        expect do
          workshop_subject.update!(scheduling_status: :cancelled)
        end.not_to change(CommunicationEmail, :count)
      end
    end
  end
end
