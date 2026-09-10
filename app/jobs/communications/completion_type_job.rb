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

        completion_recipient_user_ids(communication, user_assessment).each do |recipient_user_id|
          communication_email_attrs = { campaign_user_id: campaign_user.id, user_id: recipient_user_id }.compact
          create_or_schedule_completion_email(communication, communication_email_attrs,
                                              deduplicate: recipient_user_id.present?)
        end
      end
    end

    def completion_recipient_user_ids(communication, user_assessment)
      return communication.user_ids if communication.selected_admins_recipients?
      return assigned_assessor_ids(communication, user_assessment) if communication.selected_assessors_recipients?

      [nil]
    end

    def assigned_assessor_ids(communication, user_assessment)
      assessor_user_assessment = user_assessment.linked_assessor_user_assessment
      return [] unless assessor_user_assessment

      communication.user_ids & [assessor_user_assessment.evaluator_id]
    end

    def create_or_schedule_completion_email(communication, communication_email_attrs, deduplicate:)
      if communication.delivery_delay_hours.blank?
        return communication.emails.find_or_create_by(communication_email_attrs) if deduplicate

        return communication.emails.create(communication_email_attrs)
      end

      ScheduleDelayedCommunication.set(wait: communication.delivery_delay_hours.hours).perform_later(
        communication, communication_email_attrs
      )
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
