# frozen_string_literal: true

module Threesixty
  module Subjects
    class Remove < BaseCommand
      private_attr_reader :threesixty_campaign, :campaign, :updater_id, :subject, :remove_license_usage

      def initialize(options)
        @threesixty_campaign = options[:threesixty_campaign]
        @campaign = options[:threesixty_campaign].campaign
        @updater_id = options[:updater_id]
        @subject = options[:subject]
        @remove_license_usage = options[:remove_license_usage]
      end

      def call
        subject.users_reports.where(campaign_id: campaign.id).each(&:destroy!)
        subject.evaluated_results.where(campaign_id: campaign.id).each(&:destroy!)
        subject.participants.where(campaign_id: campaign.id).each(&:destroy!)

        if remove_license_usage
          ::Threesixty::LicenseUsages::Deactivate.call!(
            threesixty_campaign: threesixty_campaign,
            updater_id: updater_id,
            user_ids_for_deactivation: subject.user_id
          )
        end

        subject.destroy!
      end
    end
  end
end
