# frozen_string_literal: true

module AdminJobs
  class AssessmentRawResultExport < BaseExportAssessment
    private

    def call
      if assessment.agile?
        ::AdminJobs::AgileRawResultExport.call!(job_record)
      else
        ::AdminJobs::AssessmentRawExport.call!(job_record)
      end
    end
  end
end
