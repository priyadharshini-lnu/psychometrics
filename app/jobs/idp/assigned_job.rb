# frozen_string_literal: true

module Idp
  class AssignedJob < ApplicationJob
    queue_as :low_priority
    track_job_run

    def perform
      new_last_ran_at = Time.zone.now

      Communication
        .idp_template_assigned
        .joins(:campaign)
        .joins('INNER JOIN user_idp_plans ON user_idp_plans.campaign_id = communications.campaign_id')
        .select(
          'communications.id',
          'communications.campaign_id',
          'communications.kind',
          'array_agg(distinct user_idp_plans.user_id) as user_ids'
        )
        .group('communications.id')
        .each do |communication|
          CampaignUser
            .where(
              user_id: communication.user_ids,
              campaign_id: communication.campaign_id
            )
            .pluck(:id)
            .each do |campaign_user_id|
              CommunicationEmail.create(
                campaign_user_id: campaign_user_id,
                communication_id: communication.id
              )
            end
          communication.update_column(:last_ran_at, new_last_ran_at)
        end
    end
  end
end
