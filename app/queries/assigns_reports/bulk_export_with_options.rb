# frozen_string_literal: true

module AssignsReports
  class BulkExportWithOptions < Rectify::Query
    def initialize(report_ids, client = nil)
      @report_ids = report_ids
      @client = client
      @scope = initial_scope
    end

    def query
      return global_level if client.nil?
      return project_level if client.project?

      sub_project_level
    end

    # Initial scope
    #
    def initial_scope
      AssignsReport.active.where(report_id: report_ids)
    end

    private

    attr_reader :report_ids, :client, :scope

    # Returns filtered scope by status of assign
    #
    def project_level
      scope.
        joining { assign.membership }.
        joining { assign }.
        where.has { assign.status == Assign.statuses[:completed] }.
        where.has { |q| q.assign.membership.client_id == client.id }
    end

    # Returns filtered scope by status of project_assign
    #
    def sub_project_level
      scope.
        joining { assign.membership }.
        joining { assign.project_assign }.
        where.has { assign.project_assign.status == Assign.statuses[:completed] }.
        where.has { |q| q.assign.membership.client_id == client.id }
    end

    # Returns all completed AssignsReport
    #
    def global_level
      scope.
        joining { assign.project_assign }.
        where.has { (assign.status == Assign.statuses[:completed]) |
                    (assign.project_assign.status == Assign.statuses[:completed]) }
    end
  end
end
