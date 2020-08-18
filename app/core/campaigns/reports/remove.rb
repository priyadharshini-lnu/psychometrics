# frozen_string_literal: true

module Campaigns
  module Reports
    class Remove < BaseCommand
      private_attr_reader :campaign, :campaign_report

      def initialize(campaign_report)
        @campaign_report = campaign_report
        @campaign = campaign_report.campaign
      end

      def call
        campaign.user_reports.each(&:destroy!)
        campaign_report.destroy!
      end
    end
  end
end
