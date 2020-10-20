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
      {
        completion_status: campaign_user.user_assessments.all?(&:completed?) ? 2 : 3,
        completed_at: Time.now
      }
    end
  end
end
