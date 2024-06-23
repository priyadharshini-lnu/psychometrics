# frozen_string_literal: true

module WorkshopInvites
  class Webhook
    private_attr_reader :workshop_invite, :project, :webhook_id, :campaign, :workshop_invited_subject

    def initialize(workshop_invited_subject, webhook_id = nil)
      @workshop_invited_subject = workshop_invited_subject
      @workshop_invite = workshop_invited_subject.workshop_invite
      @project = workshop_invite.campaign.project
      @webhook_id = webhook_id
    end

    def publish_scheduling_invited
      WebhookSubscriptions::Publish.call(
        project,
        :scheduling_invited,
        scheduling_invited_data,
        webhook_id: webhook_id,
        record: workshop_invited_subject
      )
    end

    def prepare_localized_webhook_data
      workshop_invite.translations.each_with_object({}) do |translation, hash|
        hash[translation.locale] = {
          invite: {
            id: translation.workshop_invite_id,
            title: translation.title,
            description: translation.description
          }
        }
      end
    end

    private

    def scheduling_invited_data
      {
        subject: workshop_invited_subject.user,
        campaign: workshop_invite.campaign,
        invite: workshop_invite,
        workshops: workshops
      }
    end

    def workshops
      workshop_invite.workshops.map do |workshop|
        {
          id: workshop.id,
          name: workshop.name
        }
      end
    end
  end
end
