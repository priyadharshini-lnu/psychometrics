# frozen_string_literal: true

module WorkshopSubjects
  class Webhook
    private_attr_reader :workshop_subject, :project, :webhook_id, :workshop_invite

    def initialize(workshop_subject, webhook_id = nil)
      @workshop_subject = workshop_subject
      @workshop_invite = workshop_subject.workshop_invite
      @project = workshop_subject.campaign.project
      @webhook_id = webhook_id
    end

    def publish_scheduling_scheduled
      WebhookSubscriptions::Publish.call(
        project,
        :scheduling_scheduled,
        scheduling_scheduled_data,
        webhook_id: webhook_id,
        record: workshop_subject
      )
    end

    def publish_scheduling_cancelled
      WebhookSubscriptions::Publish.call(
        project,
        :scheduling_cancelled,
        scheduling_cancelled_data,
        webhook_id: webhook_id,
        record: workshop_subject
      )
    end

    def publish_scheduling_rescheduled
      WebhookSubscriptions::Publish.call(
        project,
        :scheduling_rescheduled,
        scheduling_rescheduled_data,
        webhook_id: webhook_id,
        record: workshop_subject
      )
    end

    def prepare_localized_webhook_data
      return unless workshop_invite

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

    def scheduling_scheduled_data
      {
        campaign: workshop_subject.campaign,
        workshop: workshop_subject.workshop,
        subject: workshop_subject.user,
        invite: workshop_invite
      }
    end

    def scheduling_cancelled_data
      {
        campaign: workshop_subject.campaign,
        workshop: workshop_subject.workshop,
        subject: workshop_subject.user,
        invite: workshop_invite
      }
    end

    def scheduling_rescheduled_data
      {
        campaign: workshop_subject.campaign,
        rescheduled_to_workshop: workshop_subject.workshop_invited_subject&.reschedule_workshop,
        rescheduled_from_workshop: workshop_subject.workshop,
        subject: workshop_subject.user,
        invite: workshop_invite
      }
    end
  end
end
