# frozen_string_literal: true

module Threesixty
  module LicenseUsages
    class Deactivate < BaseCommand
      private_attr_reader :threesixty_campaign, :updater_id, :user_ids_for_deactivation

      def initialize(options)
        @threesixty_campaign = options[:threesixty_campaign]
        @updater_id = options[:updater_id]
        @user_ids_for_deactivation = options[:user_ids_for_deactivation]
      end

      def call
        active_license_usages = threesixty_campaign.license_usages.where(
          status: 'active', user_id: user_ids_for_deactivation
        )
        active_license_usages_count = active_license_usages.count
        active_license_usages.update_all(
          status_updated_by_id: updater_id,
          status_updated_at: Time.now,
          status: 'inactive'
        )
        threesixty_license = threesixty_campaign.campaign.client.licenses.find_by(type: 'threesixty')
        threesixty_license.update!(
          used_number: threesixty_license.used_number - active_license_usages_count
        )
      end
    end
  end
end
