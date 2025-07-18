# frozen_string_literal: true

module Api
  class UserSearchQuery < Rectify::Query
    private_attr_reader :project, :search_params

    LIMIT = 10

    def initialize(project, search_params)
      @project = project
      @search_params = search_params
    end

    def query
      query = project.end_users.limit(LIMIT)
      user_fields = search_params.slice(:first_name, :last_name, :email)
      query = query.where(user_fields) if user_fields.present?
      if search_params[:datasheet].present? && project.datasheet.present?
        conditions = []
        values = []
        search_params[:datasheet].map do |k, v|
          conditions << '(sheet_columns.name = ? AND sheet_row_data.string_value = ?)'
          values.push(k, v)
        end

        query = query.joins('INNER JOIN sheet_rows ON sheet_rows.email = users.email').
                joins('INNER JOIN sheet_row_data ON sheet_row_data.sheet_row_id = sheet_rows.id').
                joins('INNER JOIN sheet_columns ON sheet_columns.id = sheet_row_data.sheet_column_id').
                where(sheet_rows: { sheet_id: project.datasheet.id }).
                where(conditions.join(' OR '), *values).
                group('users.id').
                having('COUNT(DISTINCT sheet_columns.name) = ?', search_params[:datasheet].size)
      end
      query.select(:id, :first_name, :last_name, :email, :created_at, :updated_at)
    end

    def sanitize_string(string)
      ActiveRecord::Base.sanitize_sql_string(string.to_s)
    end
  end
end
