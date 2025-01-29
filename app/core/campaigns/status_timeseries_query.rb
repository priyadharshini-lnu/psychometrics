# frozen_string_literal: true

module Campaigns
  class StatusTimeseriesQuery < Rectify::Query
    private_attr_reader :campaign, :date_from, :date_to, :campaign_users_active_in

    def initialize(campaign, date_from, date_to, campaign_users_active_in)
      @campaign = campaign
      @date_from = date_from
      @date_to = date_to
      @campaign_users_active_in = campaign_users_active_in
    end

    def sql
      timezone = ActiveSupport::TimeZone::MAPPING[Time.zone.name]
      <<-SQL.squish
      WITH date_series AS (
        SELECT
          date_trunc('#{period}',
            dd, '#{timezone}')::timestamp dt
        FROM
          generate_series(:date_from, :date_to, '1 #{period}'::interval) dd
      ),
      started_series AS (
        SELECT
          date_trunc('#{period}',
            started_at, '#{timezone}')::timestamp dt,
          count(id) started
        FROM
          campaign_users
        WHERE
          campaign_id = :id and active in (:active)
        GROUP BY
          1
      ),
      completed_series AS (
        SELECT
          date_trunc('#{period}',
            completed_at, '#{timezone}')::timestamp dt,
          count(id) completed
        FROM
          campaign_users
        WHERE
          campaign_id = :id and active in (:active)
        GROUP BY
          1
      )
      SELECT
        date_series.dt,
        started_series.started,
        completed_series.completed
      FROM
        date_series
        LEFT JOIN started_series ON date_series.dt = started_series.dt
        LEFT JOIN completed_series ON date_series.dt = completed_series.dt;
      SQL
    end

    def query
      ActiveRecord::Base.connection.execute(ApplicationRecord.sanitize_sql([sql, params]))
    end

    def params
      { id: campaign.id, date_from: date_from, date_to: date_to, active: campaign_users_active_in }
    end

    def period
      days = (date_to.to_datetime - date_from.to_datetime).to_i
      @period ||= days >= 1 ? 'days' : 'hours'
    end
  end
end
