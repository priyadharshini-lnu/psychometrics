# frozen_string_literal: true

module Dashboards
  class RefreshData < BaseCommand
    private_attr_reader :dashboard, :campaign

    def initialize(dashboard)
      @dashboard = dashboard
      @campaign = dashboard.campaign
    end

    def call
      return broadcast :ok if campaign.campaign_datasheet.nil?

      begin
        PowerBi::RefreshDataset.call!(dashboard.dataset_id)
      rescue PowerBi::RefreshFailedError => e
        return broadcast(:error, e.message)
      end
      dashboard.update!(last_refreshed_at: Time.zone.now)

      broadcast :ok
    end
  end
end
