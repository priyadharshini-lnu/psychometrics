module Callbacks
  module Models
    module AssignsReports
      class UpdateOrRemoveReportsAccess
        def after_commit(record)
          membership = record.assign.assign_with_result.membership
          reports_access = ReportsAccess.find_or_initialize_by(
            report_id: record.report_id, membership_id: membership.id
          )

          unless any_assigns_reports(record, membership).exists?
            reports_access.destroy
            return
          end

          reports_access.user_access = any_assigns_reports_with_user_access(record, membership).exists?
          reports_access.save
        end

        private

        def any_assigns_reports(record, membership)
          AssignsReport.joins(assign: [:membership]).where(
            report_id: record.report_id,
            assigns: { memberships: { client_id: membership.client.subtree_ids, user_id: membership.user_id } }
          )
        end

        def any_assigns_reports_with_user_access(record, membership)
          any_assigns_reports(record, membership).where(user_access: true)
        end
      end
    end
  end
end
