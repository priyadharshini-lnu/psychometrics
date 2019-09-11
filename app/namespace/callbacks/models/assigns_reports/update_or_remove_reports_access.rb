# frozen_string_literal: true

module Callbacks
  module Models
    module AssignsReports
      class UpdateOrRemoveReportsAccess
        def after_commit(record)
          @record = record
          @membership = @record.assign.assign_with_result.membership
          @assessment = @record.assign.assessment
          reports_access = ReportsAccess.find_or_initialize_by(
            report_id: @record.report_id, membership_id: @membership.id, assessment_id: @assessment.id
          )

          unless any_assigns_reports.exists?
            reports_access.destroy
            return
          end

          reports_access.user_access = any_assigns_reports_with_user_access.exists?
          reports_access.save
        end

        private

        def any_assigns_reports
          AssignsReport.joins(assign: [:membership]).where(
            report_id: @record.report_id,
            assigns: {
              assessment_id: @assessment.id,
              memberships: { client_id: @membership.client.subtree_ids, user_id: @membership.user_id }
            }
          )
        end

        def any_assigns_reports_with_user_access
          any_assigns_reports.where(user_access: true)
        end
      end
    end
  end
end
