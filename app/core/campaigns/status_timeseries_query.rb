# frozen_string_literal: true

module Campaigns
  class StatusTimeseriesQuery < Rectify::Query
    private_attr_reader :campaign, :date_from, :date_to

    def initialize(campaign, date_from, date_to)
      @campaign = campaign
      @date_from = date_from
      @date_to = date_to
    end

    def sql
      <<-SQL.squish
      WITH date_series AS (
        SELECT
          date_trunc('day',
            dd)::date dt
        FROM
          generate_series(:date_from, :date_to, '1 day'::interval) dd
      ),
      started_series AS (
        SELECT
          date_trunc('day',
            started_at)::date dt,
          count(id) started
        FROM
          campaign_users
        WHERE
          campaign_id = :id
        GROUP BY
          1
      ),
      completed_series AS (
        SELECT
          date_trunc('day',
            completed_at)::date dt,
          count(id) completed
        FROM
          campaign_users
        WHERE
          campaign_id = :id
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
      { id: campaign.id, date_from: date_from, date_to: date_to }
    end
  end
end
