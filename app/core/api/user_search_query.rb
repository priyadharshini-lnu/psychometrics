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
        where_datasheet = search_params[:datasheet].map do |k, v|
          "data->>'#{sanitize_string(k)}' = '#{sanitize_string(v)}'"
        end.join(' AND ')
        query = query.joins('INNER JOIN sheet_rows ON sheet_rows.email = users.email').
                where(sheet_rows: { sheet_id: project.datasheet.id }).
                where(where_datasheet)
      end
      query.select(:id, :first_name, :last_name, :email, :created_at, :updated_at)
    end

    def sanitize_string(string)
      string.to_s.gsub(/[^\w\s]+/, '')
    end
  end
end
