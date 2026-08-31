# frozen_string_literal: true

require 'rails_helper'

describe WorkshopSubject, type: :model do
  describe 'Callbacks' do
    context '#publish_scheduling_cancelled' do
      it 'publishes scheduling cancelled webhook event when cancelled' do
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

      it 'publishes scheduling cancelled webhook event when late_cancelled' do
        workshop_subject = create(:workshop_subject)
        expect(WebhookSubscriptions::Publish).to receive(:call).with(
          workshop_subject.campaign.project,
          :scheduling_cancelled,
          hash_including(cancellation_type: 'late_cancellation'),
          record: workshop_subject,
          webhook_id: nil
        )
        workshop_subject.update(scheduling_status: :late_cancelled)
      end

      it 'does not publish scheduling cancelled webhook event if status is not cancelled' do
        workshop_subject = create(:workshop_subject)
        expect(WebhookSubscriptions::Publish).not_to receive(:call)
        workshop_subject.update(scheduling_status: :scheduled)
      end
    end

    context '#publish_scheduling_rescheduled' do
      it 'publishes scheduling rescheduled webhook event when rescheduled' do
        workshop_subject = create(:workshop_subject)
        expect(WebhookSubscriptions::Publish).to receive(:call).with(
          workshop_subject.campaign.project,
          :scheduling_rescheduled,
          hash_including(rescheduling_type: 'normal_rescheduling'),
          record: workshop_subject,
          webhook_id: nil
        )
        workshop_subject.update(scheduling_status: :rescheduled)
      end

      it 'publishes scheduling rescheduled webhook event when late_rescheduled' do
        workshop_subject = create(:workshop_subject)
        expect(WebhookSubscriptions::Publish).to receive(:call).with(
          workshop_subject.campaign.project,
          :scheduling_rescheduled,
          hash_including(rescheduling_type: 'late_rescheduling'),
          record: workshop_subject,
          webhook_id: nil
        )
        workshop_subject.update(scheduling_status: :late_rescheduled)
      end
    end

    context '#publish_workshop_attendance_status' do
      it 'publishes workshop attendance status webhook event when attendance_status changes' do
        workshop_subject = create(:workshop_subject)
        expect(WebhookSubscriptions::Publish).to receive(:call).with(
          workshop_subject.campaign.project,
          :workshop_attendance_status,
          hash_including(status: 'no_show'),
          record: workshop_subject,
          webhook_id: nil
        )
        workshop_subject.update(attendance_status: :no_show)
      end

      it 'does not publish workshop attendance status webhook event when attendance_status does not change' do
        workshop_subject = create(:workshop_subject)
        expect(WebhookSubscriptions::Publish).not_to receive(:call).with(
          anything,
          :workshop_attendance_status,
          anything,
          anything
        )
        workshop_subject.update(scheduling_status: :rescheduled)
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

    context 'when an active CommunicationDelivery exists for the matching assessment group' do
      let!(:delivery) do
        create(:communication_delivery, :workshop_booked, client: campaign.project.parent,
                                                              project: campaign.project, campaign: campaign,
                                                              campaign_assessment_group: assessment_group)
      end

      context 'and use_new_communication_center is disabled for the client (default)' do
        it 'sends the legacy email only -- the delivery is not usable without the flag' do
          expect do
            create(:workshop_subject, workshop: workshop, workshop_invite: workshop_invite, campaign: campaign,
                                       user: user)
          end.to change(CommunicationEmail, :count).by(1)

          expect(CommunicationEmail.where(communication_delivery: delivery)).to be_empty
        end
      end

      context 'and use_new_communication_center is enabled for the client' do
        before { campaign.project.parent.client_feature.update!(use_new_communication_center: true) }

        it 'sends the delivery-sourced email only -- the flag suppresses the legacy send' do
          expect do
            create(:workshop_subject, workshop: workshop, workshop_invite: workshop_invite, campaign: campaign,
                                       user: user)
          end.to change(CommunicationEmail, :count).by(1)

          delivery_email = CommunicationEmail.find_by(communication_delivery: delivery)
          expect(delivery_email.workshop).to eq(workshop)
          expect(delivery_email.workshop_invite).to eq(workshop_invite)
          expect(communication.reload.emails).to be_empty
        end
      end
    end

    context 'when the active CommunicationDelivery is for a different assessment group' do
      before { campaign.project.parent.client_feature.update!(use_new_communication_center: true) }

      let!(:delivery) do
        other_group = create(:campaign_assessment_group, campaign: campaign, group_type: 1)
        create(:communication_delivery, :workshop_booked, client: campaign.project.parent,
                                                              project: campaign.project, campaign: campaign,
                                                              campaign_assessment_group: other_group)
      end

      it 'does not create a delivery-sourced email even with the flag enabled' do
        create(:workshop_subject, workshop: workshop, workshop_invite: workshop_invite, campaign: campaign,
                                   user: user)

        expect(CommunicationEmail.where(communication_delivery: delivery)).to be_empty
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

    context 'when an active CommunicationDelivery exists for the matching assessment group' do
      let!(:delivery) do
        create(:communication_delivery, :workshop_cancelled, client: campaign.project.parent,
                                                                 project: campaign.project, campaign: campaign,
                                                                 campaign_assessment_group: assessment_group)
      end

      context 'and use_new_communication_center is enabled for the client' do
        before { campaign.project.parent.client_feature.update!(use_new_communication_center: true) }

        it 'sends the delivery-sourced email only -- the flag suppresses the legacy send' do
          workshop_subject = create(:workshop_subject,
                                    workshop: workshop,
                                    workshop_invite: workshop_invite,
                                    campaign: campaign,
                                    user: user,
                                    scheduling_status: :scheduled)

          expect do
            workshop_subject.update!(scheduling_status: :cancelled)
          end.to change(CommunicationEmail, :count).by(1)

          delivery_email = CommunicationEmail.find_by(communication_delivery: delivery)
          expect(delivery_email.workshop).to eq(workshop)
          expect(delivery_email.workshop_invite).to eq(workshop_invite)
          expect(communication.reload.emails).to be_empty
        end
      end

      context 'and use_new_communication_center is disabled for the client (default)' do
        it 'sends the legacy email only -- the delivery is not usable without the flag' do
          workshop_subject = create(:workshop_subject,
                                    workshop: workshop,
                                    workshop_invite: workshop_invite,
                                    campaign: campaign,
                                    user: user,
                                    scheduling_status: :scheduled)

          expect do
            workshop_subject.update!(scheduling_status: :cancelled)
          end.to change(CommunicationEmail, :count).by(1)

          expect(CommunicationEmail.where(communication_delivery: delivery)).to be_empty
        end
      end
    end
  end
end
