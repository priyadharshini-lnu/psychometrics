# frozen_string_literal: true

module CampaignUsers
  class Timeout < BaseCommand
    def call
      CampaignUser.in_progress.
        joins(:campaign).
        merge(Campaign.fixed_time).
        where('expiry_date < ?', Time.now).
        update_all(attributes)

      broadcast :ok
    end

    private

    def attributes
      { completed_at: Time.now, completion_status: :completed, completed_via: :timed_out }
    end
  end
end
