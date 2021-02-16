# frozen_string_literal: true

module CampaignUsers
  class SetCompletionStatus < BaseCommand
    private_attr_reader :campaign_user

    def initialize(campaign_user)
      @campaign_user = campaign_user
    end

    def call
      completion_status = compute_completion_status

      return broadcast :ok if campaign_user.completion_status == completion_status

      campaign_user.update_attributes({
        completed_at: completion_status == 'completed' ? Time.now : nil,
        completion_status: completion_status
      })

      broadcast :ok
    end

    private

    def compute_completion_status
      statuses = campaign_user.campaign_user_assessments.map(&:status)

      return 'not_started' if statuses.empty?

      return 'completed' if statuses.all? { |status| status == 'completed' }

      return 'not_started' if statuses.all? { |status| status == 'not_started' }

      'in_progress'
    end
  end
end
