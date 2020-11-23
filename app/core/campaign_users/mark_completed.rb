# frozen_string_literal: true

module CampaignUsers
  class MarkCompleted < BaseCommand
    private_attr_reader :campaign_user

    def initialize(campaign_user)
      @campaign_user = campaign_user
    end

    def call
      campaign_user.update_attributes(attributes)

      broadcast :ok
    end

    private

    def attributes
      {
        completed_at: Time.now,
        completion_status: :completed,
        completed_via: campaign_user.user_assessments.all?(&:completed?) ? :user : :timed_out
      }
    end
  end
end
