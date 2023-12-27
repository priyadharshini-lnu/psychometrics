# frozen_string_literal: true

module AdminJobs
  module SuperAdmin
    class AssessmentRawResultExport < BaseExportAssessment
      private

      def call
        if assessment.agile?
          ::AdminJobs::SuperAdmin::AgileRawResultExport.call!(job_record)
        else
          ::AdminJobs::SuperAdmin::AssessmentRawExport.call!(job_record)
        end
      end
    end
  end
end
