# frozen_string_literal: true

module Campaigns
  class StatusTimeseriesQuery < Rectify::Query
    private_attr_reader :campaign, :date_from, :date_to, :campaign_users_active_in, :datasheet_filters,
                        :filtered_user_ids

    def initialize(campaign, date_from, date_to, campaign_users_active_in, datasheet_filters)
      @campaign = campaign
      @date_from = date_from
      @date_to = date_to
      @campaign_users_active_in = campaign_users_active_in
      @datasheet_filters = datasheet_filters
      @filtered_user_ids = get_filtered_user_ids
    end

    def get_filtered_user_ids
      campaign_user_data = CampaignUser.joins(:user).
                           where(campaign_id: campaign.id, active: campaign_users_active_in, users: { is_uat: false }).
                           select('campaign_users.id, users.email')

      valid_users_ids = campaign_user_data.map(&:id)

      if @datasheet_filters.present?
        datasheet_rows = campaign.project_datasheet.rows.map { |r| SheetRows::GetData.call!(r).except(:id) }
        valid_users_ids = campaign_user_data.select do |cu|
          campaign_user_passes_datasheet_filter?(cu, datasheet_rows)
        end.map(&:id)
      end
      valid_users_ids
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
          campaign_id = :id and active in (:active) and id IN (:filtered_user_ids)
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
          campaign_id = :id and active in (:active) and id IN (:filtered_user_ids)
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
      { id: campaign.id,
        date_from: date_from,
        date_to: date_to,
        active: campaign_users_active_in,
        filtered_user_ids: filtered_user_ids }
    end

    def period
      days = (date_to.to_datetime - date_from.to_datetime).to_i
      @period ||= days >= 1 ? 'days' : 'hours'
    end

    def get_datasheet_row_for_user(campaign_user_data, datasheet_rows)
      datasheet_rows.find do |row|
        %w[Email email].any? { |key| row[key].to_s.strip.casecmp?(campaign_user_data.email.to_s.strip) }
      end
    end

    def campaign_user_passes_datasheet_filter?(filtered_campaign_user, datasheet_rows)
      return true if @datasheet_filters.blank?

      user_datasheet_row = get_datasheet_row_for_user(filtered_campaign_user, datasheet_rows)
      user_datasheet_row = {} if user_datasheet_row.blank?

      @datasheet_filters.each do |field, valid_options|
        row_value = user_datasheet_row[field.to_s]
        return false if valid_options.exclude?(row_value)
      end
      true
    end
  end
end
