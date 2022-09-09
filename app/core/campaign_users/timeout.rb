# frozen_string_literal: true

module CampaignUsers
  class Timeout < BaseCommand
    def call
      CampaignUser.in_progress.
        joins(:campaign).
        merge(Campaign.fixed_time).
        where('expiry_date < ?', Time.zone.now).
        update_all(attributes)

      broadcast :ok
    end

    private

    def attributes
      { completed_at: Time.zone.now, status: :timed_out }
    end
  end
end
