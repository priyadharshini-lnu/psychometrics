# frozen_string_literal: true

require 'rails_helper'

RSpec.describe WorkshopSubjects::Webhook do
  let!(:campaign) { create(:campaign) }
  let!(:user) { create(:user) }
  let!(:workshop_subject) { create(:workshop_subject, campaign: campaign, user: user) }

  describe '#publish_scheduling_scheduled' do
    it 'publishes scheduling scheduled' do
      scheduling_scheduled_data = {
        campaign: workshop_subject.campaign,
        workshop: workshop_subject.workshop,
        subject: workshop_subject.user,
        invite: workshop_subject.workshop_invite
      }

      expect(WebhookSubscriptions::Publish).to receive(:call).with(
        campaign.project, :scheduling_scheduled, scheduling_scheduled_data, record: workshop_subject, webhook_id: nil
      )
      described_class.new(workshop_subject).publish_scheduling_scheduled
    end
  end

  describe '#publish_scheduling_cancelled' do
    it 'publishes scheduling cancelled with normal_cancellation type' do
      scheduling_cancelled_data = {
        campaign: workshop_subject.campaign,
        workshop: workshop_subject.workshop,
        subject: workshop_subject.user,
        invite: workshop_subject.workshop_invite,
        cancellation_type: 'normal_cancellation'
      }

      expect(WebhookSubscriptions::Publish).to receive(:call).with(
        campaign.project, :scheduling_cancelled, scheduling_cancelled_data, record: workshop_subject, webhook_id: nil
      )
      described_class.new(workshop_subject).publish_scheduling_cancelled
    end

    it 'publishes scheduling cancelled with late_cancellation type when late cancelled' do
      late_cancelled_subject = create(:workshop_subject, campaign: campaign, user: user,
scheduling_status: :late_cancelled)
      scheduling_cancelled_data = {
        campaign: late_cancelled_subject.campaign,
        workshop: late_cancelled_subject.workshop,
        subject: late_cancelled_subject.user,
        invite: late_cancelled_subject.workshop_invite,
        cancellation_type: 'late_cancellation'
      }

      expect(WebhookSubscriptions::Publish).to receive(:call).with(
        campaign.project, :scheduling_cancelled, scheduling_cancelled_data,
        record: late_cancelled_subject, webhook_id: nil
      )
      described_class.new(late_cancelled_subject).publish_scheduling_cancelled
    end
  end

  describe '#publish_scheduling_rescheduled' do
    it 'publishes scheduling rescheduled with normal_rescheduling type' do
      scheduling_rescheduled_data = {
        campaign: workshop_subject.campaign,
        rescheduled_to_workshop: workshop_subject.workshop_invited_subject.reschedule_workshop,
        rescheduled_from_workshop: workshop_subject.workshop,
        subject: workshop_subject.user,
        invite: workshop_subject.workshop_invite,
        rescheduling_type: 'normal_rescheduling'
      }

      expect(WebhookSubscriptions::Publish).to receive(:call).with(
        campaign.project,
        :scheduling_rescheduled,
        scheduling_rescheduled_data,
        record: workshop_subject,
        webhook_id: nil
      )
      described_class.new(workshop_subject).publish_scheduling_rescheduled
    end

    it 'publishes scheduling rescheduled with late_rescheduling type when late rescheduled' do
      late_rescheduled_subject = create(:workshop_subject, campaign: campaign, user: user,
scheduling_status: :late_rescheduled)
      scheduling_rescheduled_data = {
        campaign: late_rescheduled_subject.campaign,
        rescheduled_to_workshop: late_rescheduled_subject.workshop_invited_subject.reschedule_workshop,
        rescheduled_from_workshop: late_rescheduled_subject.workshop,
        subject: late_rescheduled_subject.user,
        invite: late_rescheduled_subject.workshop_invite,
        rescheduling_type: 'late_rescheduling'
      }

      expect(WebhookSubscriptions::Publish).to receive(:call).with(
        campaign.project,
        :scheduling_rescheduled,
        scheduling_rescheduled_data,
        record: late_rescheduled_subject,
        webhook_id: nil
      )
      described_class.new(late_rescheduled_subject).publish_scheduling_rescheduled
    end
  end

  describe '#publish_workshop_attendance_status' do
    it 'publishes workshop attendance status' do
      workshop_attendance_status_data = {
        campaign: workshop_subject.campaign,
        workshop: workshop_subject.workshop,
        subject: workshop_subject.user,
        status: workshop_subject.attendance_status
      }

      expect(WebhookSubscriptions::Publish).to receive(:call).with(
        campaign.project,
        :workshop_attendance_status,
        workshop_attendance_status_data,
        record: workshop_subject,
        webhook_id: nil
      )
      described_class.new(workshop_subject).publish_workshop_attendance_status
    end
  end
end
