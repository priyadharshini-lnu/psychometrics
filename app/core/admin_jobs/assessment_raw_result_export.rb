# frozen_string_literal: true

module AdminJobs
  class AssessmentRawResultExport < BaseExportAssessment
    private

    def xlsx
      ::Assessments::Export::RawExport.call!(
        assessment, campaign, export_with_labels: record.data['export_with_labels']
      )
    end

    def file_name
      "assessment-#{assessment.id}-raw-results.xlsx"
    end
  end
end
