# frozen_string_literal: true

module CampaignReports
  class Remove < BaseCommand
    private_attr_reader :campaign, :campaign_report, :remove_user_reports

    def initialize(options)
      @campaign_report = options[:campaign_report]
      @remove_user_reports = options[:remove_user_reports]
      @campaign = campaign_report.campaign
    end

    def call
      campaign.user_reports.where(report_id: campaign_report.report_id).find_each(&:destroy!) if remove_user_reports
      campaign_report.destroy!
    end
  end
end
