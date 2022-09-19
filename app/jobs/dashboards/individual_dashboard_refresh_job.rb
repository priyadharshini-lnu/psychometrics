# frozen_string_literal: true

module Dashboards
  class IndividualDashboardRefreshJob < ApplicationJob
    queue_as :default

    def perform(dashboard)
      Dashboards::RefreshData.call(dashboard) do
        on(:error) do |message|
          Rails.logger.error("Failed refresh for dashboard with id #{dashboard.id}. Error: #{message}")
        end
      end
    end
  end
end
