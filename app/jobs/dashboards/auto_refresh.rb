# frozen_string_literal: true

module Dashboards
  class AutoRefresh < ApplicationJob
    queue_as :default

    def perform
      Dashboard.auto_refressable.
        where('refresh_tried_at IS NULL OR (extract(epoch from (now() - refresh_tried_at)) / 60) > refresh_interval').
        find_each do |dashboard|
          Dashboards::IndividualDashboardRefreshJob.perform_later(dashboard)
        end
    end
  end
end
