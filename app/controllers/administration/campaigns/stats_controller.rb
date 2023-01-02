# frozen_string_literal: true

module Administration
  module Campaigns
    class StatsController < Administration::Campaigns::BaseController
      skip_after_action :verify_policy_scoped

      def index
        stats = ::Campaigns::BuildStats.call!(campaign)
        render json: stats
      end

      def timeseries
        timeseries = ::Campaigns::StatusTimeseriesQuery.new(
          campaign, params[:range].first, params[:range].last
        ).query.map do |item|
          { 'dt' => item['dt'], 'started' => item['started'] || 0, 'completed' => item['completed'] || 0 }
        end

        render json: timeseries
      end

      def resource_class
        Campaign
      end
    end
  end
end
