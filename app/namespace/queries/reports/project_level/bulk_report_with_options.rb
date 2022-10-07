# frozen_string_literal: true

module Queries
  module Reports
    module ProjectLevel
      class BulkReportWithOptions < ::Queries::Base
        def initialize(relation = initial_scope)
          @relation = relation
        end

        def initial_scope
          Report.enabled.
            select('reports.id, memberships.user_id, assigns.id as assign_id, assigns_reports.id as assigns_report_id').
            joins(assigns_reports: { assign: :membership })
        end

        def call(client_id, report_ids, start_date, end_date)
          filter_by_report_ids(report_ids)
          filter_by_client_id(client_id)
          filter_by_completion_date(start_date, end_date)
          filter_by_membership_role

          @relation
        end

        private

        def filter_by_report_ids(report_ids)
          @relation = @relation.where('reports.id': report_ids)
        end

        def filter_by_client_id(client_id)
          @relation = @relation.where(memberships: { client_id: client_id })
        end

        def filter_by_completion_date(start_date, end_date)
          @relation = @relation.
                      where(assigns: { status: Assign.statuses[:completed] }).
                      where('assigns.completed_at::date BETWEEN ? AND ?', start_date.to_date, end_date.to_date)
        end

        def filter_by_membership_role
          @relation = @relation.where.not(memberships: { role: Membership.roles[Membership::PROJECT_ADMIN_ROLE] })
        end
      end
    end
  end
end
