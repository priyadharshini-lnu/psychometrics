# frozen_string_literal: true

module Users
  class SearchByAvailability < Rectify::Query
    private_attr_reader :start_date_time, :end_date_time, :user_scope, :limit, :offset, :search_term

    # rubocop:disable Metrics/ParameterLists
    def initialize(start_date_time, end_date_time, user_scope: nil, limit: 10, offset: 0, search_term: nil)
      @start_date_time = start_date_time
      @end_date_time = end_date_time
      @user_scope = user_scope
      @limit = limit
      @offset = offset
      @search_term = search_term
    end
    # rubocop:enable Metrics/ParameterLists

    def query
      params = {
        start_date_time: start_date_time,
        end_date_time: end_date_time,
        start_date: start_date_time.to_date.advance(days: -1),
        end_date: end_date_time.to_date.advance(days: 1),
        limit: limit,
        offset: offset
      }
      User.find_by_sql(ApplicationRecord.sanitize_sql([sql, params]))
    end

    def sql
      <<-SQL.squish
        SELECT DISTINCT users.*
        FROM
          (
            SELECT
              user_availability_dates.id,
              user_availability_dates.user_id,
              (
                dates + user_availability_days.start_time::time
              ):: TIMESTAMP AT TIME ZONE user_availability_dates.timezone AS start_date,
              (
                dates + user_availability_days.end_time::time
              ):: TIMESTAMP AT TIME ZONE user_availability_dates.timezone AS end_date,
              dates,
              EXTRACT(dow FROM dates) AS day
            FROM
              user_availability_dates
              LEFT JOIN user_availability_days ON user_availability_days.user_availability_date_id = user_availability_dates.id
              LEFT JOIN generate_series(:start_date, :end_date, interval '1 day') AS dates ON TRUE
            WHERE
              user_availability_days."day" = EXTRACT(dow FROM dates)
          ) available_users
          LEFT JOIN user_bookings ON user_bookings.user_id = available_users.user_id
          AND(
            (user_bookings.start_time :: TIMESTAMP AT TIME ZONE 'UTC', user_bookings.end_time :: TIMESTAMP AT TIME ZONE 'UTC')
            OVERLAPS (:start_date_time :: TIMESTAMP WITH time zone, :end_date_time :: TIMESTAMP WITH time zone)
          )
          LEFT JOIN users ON users.id = available_users.user_id
        WHERE
        start_date <= :start_date_time :: TIMESTAMP WITH time zone
        AND end_date >= :end_date_time :: TIMESTAMP WITH time zone
        #{user_scope_query_fragment}
        #{search_term_query_fragment}
        LIMIT :limit
        OFFSET :offset
      SQL
    end

    def search_term_query_fragment
      return if search_term.blank?

      sql = <<-SQL.squish
        AND (
          CONCAT(users.first_name, ' ', users.last_name) ILIKE :search_term OR
          users.email ILIKE :search_term
        )
      SQL

      ApplicationRecord.sanitize_sql([sql, { search_term: "%#{search_term}%" }])
    end

    def user_scope_query_fragment
      return if user_scope.nil?

      "AND users.id IN (#{user_scope.select('id').to_sql})"
    end
  end
end
