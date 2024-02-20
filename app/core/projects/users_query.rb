# frozen_string_literal: true

module Projects
  class UsersQuery < Rectify::Query
    include Rectify::SqlQuery

    LIMIT = 5

    def initialize(project, q)
      @project = project
      @q = "%#{q}%"
    end

    def model
      User
    end

    def sql
      <<-SQL.squish
        SELECT users.id, users.email, users.first_name, users.last_name, 'users' as source, user_profiles.locale
        FROM users
        JOIN user_profiles ON users.id = user_profiles.user_id
        WHERE project_id = :project_id AND (email LIKE :query OR first_name LIKE :query OR last_name LIKE :query)
        UNION
        SELECT sheet_rows.id, sheet_rows.email, null as first_name, null as last_name, 'sheets' as source, null as locale
        FROM sheet_rows
        JOIN sheets on sheets.id = sheet_rows.sheet_id and sheets.project_id = :project_id
        WHERE sheets.type = 'Datasheet' AND sheet_rows.email LIKE :query
        LIMIT :limit
      SQL
    end

    def params
      { project_id: project.id, query: q, limit: LIMIT }
    end

    private

    attr_reader :project, :q
  end
end
