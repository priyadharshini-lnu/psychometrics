# frozen_string_literal: true

require 'rails_helper'

RSpec.describe WorkshopInvites::Webhook do
  let!(:campaign) { create(:campaign) }
  let!(:user) { create(:user) }
  let!(:workshop_invited_subject) { create(:workshop_invited_subject, campaign: campaign, user: user) }

  describe '#publish_scheduing_invited' do
    it 'publishes scheduling invited' do
      scheduling_invited_data = {
        subject: workshop_invited_subject.user,
        campaign: workshop_invited_subject.workshop_invite.campaign,
        invite: workshop_invited_subject.workshop_invite,
        workshops: workshop_invited_subject.workshop_invite.workshops.map do |workshop|
          {
            id: workshop.id,
            name: workshop.name
          }
        end
      }

      expect(WebhookSubscriptions::Publish).to receive(:call).with(
        campaign.project,
        :scheduling_invited,
        scheduling_invited_data,
        record: workshop_invited_subject,
        webhook_id: nil
      )
      described_class.new(workshop_invited_subject).publish_scheduling_invited
    end
  end
end
