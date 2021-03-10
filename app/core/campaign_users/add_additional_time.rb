# frozen_string_literal: true

module CampaignUsers
  class AddAdditionalTime < BaseCommand
    private_attr_reader :campaign_user, :additional_time

    def initialize(campaign_user, additional_time)
      @campaign_user = campaign_user
      @additional_time = additional_time
    end

    def call
      broadcast :invalid unless campaign_user
      broadcast :invalid unless additional_time || additional_time.negative?

      transaction do
        add_additional_time
      end

      broadcast :ok
    end

    private

    def add_additional_time
      campaign_user.update_attributes(
        status: :interrupted,
        additional_time: additional_time,
        expiry_date: nil
      )
    end
  end
end
