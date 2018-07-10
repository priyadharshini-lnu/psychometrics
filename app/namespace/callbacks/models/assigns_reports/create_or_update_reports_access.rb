module Callbacks
  module Models
    module AssignsReports
      class CreateOrUpdateReportsAccess
        def after_commit(record)
          reports_access = ReportsAccess.find_or_initialize_by(
            report_id: record.report_id, membership_id: record.assign.assign_with_result.membership_id
          )

          reports_access.user_access ||= record.user_access
          reports_access.save
        end
      end
    end
  end
end
