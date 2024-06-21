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
      described_class.new(workshop_subject.id).publish_scheduling_scheduled
    end
  end

  describe '#publish_scheduling_cancelled' do
    it 'publishes scheduling cancelled' do
      scheduling_cancelled_data = {
        campaign: workshop_subject.campaign,
        workshop: workshop_subject.workshop,
        subject: workshop_subject.user,
        invite: workshop_subject.workshop_invite
      }

      expect(WebhookSubscriptions::Publish).to receive(:call).with(
        campaign.project, :scheduling_cancelled, scheduling_cancelled_data, record: workshop_subject, webhook_id: nil
      )
      described_class.new(workshop_subject.id).publish_scheduling_cancelled
    end
  end

  describe '#publish_scheduling_rescheduled' do
    it 'publishes scheduling rescheduled' do
      scheduling_rescheduled_data = {
        campaign: workshop_subject.campaign,
        rescheduled_to_workshop: workshop_subject.workshop_invited_subject.reschedule_workshop,
        rescheduled_from_workshop: workshop_subject.workshop,
        subject: workshop_subject.user,
        invite: workshop_subject.workshop_invite
      }

      expect(WebhookSubscriptions::Publish).to receive(:call).with(
        campaign.project,
        :scheduling_rescheduled,
        scheduling_rescheduled_data,
        record: workshop_subject,
        webhook_id: nil
      )
      described_class.new(workshop_subject.id).publish_scheduling_rescheduled
    end
  end
end
