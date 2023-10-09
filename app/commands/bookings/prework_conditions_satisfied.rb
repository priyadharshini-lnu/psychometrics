# frozen_string_literal: true

module Bookings
  class PreworkConditionsSatisfied < BaseCommand
    attr_reader :campaign_id, :user_id

    def initialize(campaign_id, user_id)
      @campaign_id = campaign_id
      @user_id = user_id
    end

    def call
      return broadcast(:ok, true) unless campaign_preworks_required?

      broadcast(:ok, all_preworks_complete?)
    end

    private

    def campaign_preworks_required?
      CampaignOptions.find_by(campaign_id: campaign_id).workshop_booking_requires_prework_completion?
    end

    def all_preworks_complete?
      user_prework_status = Campaigns::GetPreworks.call!(campaign_id, user_id)[user_id]
      user_prework_status.present? ? user_prework_status['completed'] == user_prework_status['total'] : true
    end
  end
end
