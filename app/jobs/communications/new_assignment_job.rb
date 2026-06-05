# frozen_string_literal: true

module Communications
  class NewAssignmentJob < ApplicationJob
    queue_as :low_priority

    def perform
      new_last_ran_at = Time.zone.now
      Communication.
        new_assignment_recipients.
        joins(project_campaign: :user_assessments).
        where('subject_id = evaluator_id AND user_assessments.created_at > communications.last_ran_at').
        select(
          'communications.id',
          'communications.campaign_id',
          'communications.kind',
          'communications.delivery_interval',
          'array_agg(distinct user_assessments.subject_id) as subject_ids'
        ).
        group('communications.id').
        each do |communication|
          CampaignUser.where(
            user_id: communication.subject_ids,
            campaign_id: communication.campaign_id
          ).pluck(:id).
            each do |camapaign_user_id|
              CommunicationEmail.create(campaign_user_id: camapaign_user_id, communication_id: communication.id)
            end
          communication.update_column(:last_ran_at, new_last_ran_at)
        end
    end
  end
end
