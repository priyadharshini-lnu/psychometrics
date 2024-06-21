# frozen_string_literal: true

require 'rails_helper'

describe WorkshopSubject, type: :model do
  describe 'Callbacks' do
    context '#publish_scheduling_cancelled' do
      it 'publishes scheduling cancelled webhook event' do
        workshop_subject = create(:workshop_subject)
        webhook = WorkshopSubjects::Webhook.new(workshop_subject.id)
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
end
