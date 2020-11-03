# frozen_string_literal: true

module CampaignUsers
  class UpdateCompletionStatus < BaseCommand
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
      status = campaign_user.user_assessments.all?(&:completed?) ? :completed : :interrupted
      {
        completed_at: Time.now,
        completion_status: status,
        completed_via: status == :completed ? :user : :timed_out
      }
    end
  end
end
