# frozen_string_literal: true

module Licenses
  class WeeklyStatsJob < ApplicationJob
    def perform
      users = User.enabled_super_admins.where('settings @> ?', { weekly_license_stats: true }.to_json)
      users.each do |user|
        LicenseMailer.weekly_stats(user.id).deliver_later
      end
    end
  end
end
