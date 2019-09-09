# frozen_string_literal: true

module Queries
  module Reports
    module SubProjectLevel
      class BulkReportWithOptions < ::Queries::Base
        def initialize(relation = initial_scope)
          @relation = relation
        end

        def initial_scope
          Report.enabled.
            select(
              'reports.id,
              memberships.user_id,
              project_assigns_assigns.id as assign_id,
              assigns_reports.id as assigns_report_id'
            ).
            joins(assigns_reports: { assign: %i[membership project_assign] })
        end

        def call(client_id, report_ids, start_date, end_date)
          filter_by_report_ids(report_ids)
          filter_by_client_id(client_id)
          filter_by_completion_date(start_date, end_date)
          filter_by_membership_role

          without_norm_data.or(eti).or(yti).or(common)
        end

        private

        def filter_by_report_ids(report_ids)
          @relation = @relation.where('reports.id': report_ids)
        end

        def filter_by_client_id(client_id)
          @relation = @relation.where('memberships.client_id = ?', client_id)
        end

        def filter_by_completion_date(start_date, end_date)
          @relation = @relation.
                      where('project_assigns_assigns.status = ?', Assign.statuses[:completed]).
                      where(
                        'project_assigns_assigns.completed_at::date BETWEEN ? AND ?',
                        start_date.to_date,
                        end_date.to_date
                      )
        end

        def filter_by_membership_role
          @relation = @relation.where('memberships.role != ?', Membership.roles[Membership::PROJECT_ADMIN_ROLE])
        end

        def without_norm_data
          @relation.where('assigns.norm_data is NULL').
            or(@relation.where("assigns.norm_data->>'type' is NULL"))
        end

        def with_norm_data
          @relation.where('assigns.norm_data is NOT NULL').
            where("assigns.norm_data->>'type' is NOT NULL")
        end

        def eti
          with_norm_data.where("assigns.norm_data->>'type' = ?", 'ETI').where(type: 'eti')
        end

        def yti
          with_norm_data.where("assigns.norm_data->>'type' = ?", 'YTI').where(type: 'yti')
        end

        def common
          with_norm_data.where(type: 'common')
        end
      end
    end
  end
end
