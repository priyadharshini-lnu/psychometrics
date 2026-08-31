# frozen_string_literal: true

module Communications
  class CompletionTypeJob < ApplicationJob
    queue_as :communication

    def perform(user_assessment)
      campaign_user = CampaignUser.find_by(
        campaign_id: user_assessment.campaign_id,
        user_id: user_assessment.user_id
      )
      return unless campaign_user

      send_legacy_completion_emails(user_assessment, campaign_user)
      send_delivery_completion_emails(user_assessment, campaign_user)
    end

    private

    def send_legacy_completion_emails(user_assessment, campaign_user)
      communications = Communication.completion.where(
        campaign_id: user_assessment.campaign_id,
        assessment_id: user_assessment.assessment_id
      ).includes(:project)

      communications.each do |communication|
        if communication.assessment_completion_status_code.present? &&
           communication.assessment_completion_status_code != user_assessment.completion_status_code
          next
        end
        next if communication.selected_recipients? && communication.user_ids.exclude?(user_assessment.user_id)

        communication_email_attrs = { campaign_user_id: campaign_user.id }
        next communication.emails.create(communication_email_attrs) if communication.delivery_delay_hours.blank?

        ScheduleDelayedCommunication.set(wait: communication.delivery_delay_hours.hours).perform_later(
          communication, communication_email_attrs
        )
      end
    end

    def send_delivery_completion_emails(user_assessment, campaign_user)
      return unless user_assessment.campaign.project.client.feature_enabled?(:use_new_communication_center)

      deliveries = CommunicationDelivery.joins(:communication_template).where(
        communication_templates: { kind: :completion },
        campaign_id: user_assessment.campaign_id,
        status: :active
      )

      deliveries.each do |delivery|
        if delivery.assessment_completion_status_code.present? &&
           delivery.assessment_completion_status_code != user_assessment.completion_status_code
          next
        end
        next if delivery.selected_assessments.any? && delivery.selected_assessments.exclude?(user_assessment.assessment)
        next if delivery.selected_recipients? && delivery.selected_users.exclude?(user_assessment.user)

        communication_email_attrs = {
          campaign_user_id: campaign_user.id, occurrence_key: "completion-#{user_assessment.id}"
        }
        next delivery.emails.create(communication_email_attrs) if delivery.delivery_delay_hours.blank?

        ScheduleDelayedCommunication.set(wait: delivery.delivery_delay_hours.hours).perform_later(
          delivery, communication_email_attrs
        )
      end
    end
  end
end
