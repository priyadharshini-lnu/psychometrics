# frozen_string_literal: true

module Communications
  class CompletionTypeJob < ApplicationJob
    queue_as :communication

    def perform(user_assessment)
      communications = Communication.completion.where(
        campaign_id: user_assessment.campaign_id,
        assessment_id: user_assessment.assessment_id
      ).includes(:project)
      campaign_user = CampaignUser.find_by(
        campaign_id: user_assessment.campaign_id,
        user_id: user_assessment.user_id
      )

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
  end
end
