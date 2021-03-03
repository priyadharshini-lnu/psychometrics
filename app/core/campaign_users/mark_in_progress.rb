# frozen_string_literal: true

module CampaignUsers
  class MarkInProgress < BaseCommand
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
      { status: :in_progress, completed_at: nil }
    end
  end
end
