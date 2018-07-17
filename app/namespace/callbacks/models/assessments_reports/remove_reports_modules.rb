module Callbacks
  module Models
    module AssessmentsReports
      class RemoveReportsModules
        def after_commit(record)
          reports_modules(record.assessment_id, record.report_id).destroy_all
        end

        private

        def reports_modules(assessment_id, report_id)
          ::Reports::Module.joins(:page).where(assessment_id: assessment_id, reports_pages: { report_id: report_id })
        end
      end
    end
  end
end
