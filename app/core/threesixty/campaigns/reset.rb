# frozen_string_literal: true

module Threesixty
  module Campaigns
    class Reset < BaseCommand
      private_attr_reader :threesixty_campaign, :updater_id, :remove_license_usage

      ASSOCIATIONS_TO_REMOVE = %i[
        nomination_requirements
        participants
        campaigns_users
        subjects
        evaluators
      ].freeze

      def initialize(options)
        @threesixty_campaign = options[:threesixty_campaign]
        @updater_id = options[:updater_id]
        @remove_license_usage = options[:remove_license_usage]
      end

      def call
        threesixty_campaign_user_ids = threesixty_campaign.subjects.pluck(:user_id)
        ASSOCIATIONS_TO_REMOVE.each { |association| threesixty_campaign.public_send(association).find_each(&:destroy!) }
        if remove_license_usage
          ::Threesixty::LicenseUsages::Deactivate.call!(
            threesixty_campaign: threesixty_campaign,
            updater_id: updater_id,
            user_ids_for_deactivation: threesixty_campaign_user_ids
          )
        end
      end
    end
  end
end
