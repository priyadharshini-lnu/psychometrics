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
      <<-SQL.strip_heredoc
        SELECT users.id, users.email, users.first_name, users.last_name, 'users' as source
        FROM users
        WHERE project_id = :project_id AND (email LIKE :query OR first_name LIKE :query OR last_name LIKE :query)
        UNION
        SELECT datasheet_rows.id, datasheet_rows.email, null as first_name, null as last_name, 'datasheets' as source
        FROM datasheet_rows
        JOIN datasheets on datasheets.id = datasheet_rows.datasheet_id and datasheets.project_id = :project_id
        WHERE datasheet_rows.email LIKE :query
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
