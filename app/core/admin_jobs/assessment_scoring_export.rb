# frozen_string_literal: true

module AdminJobs
  class AssessmentScoringExport < BaseExportAssessment
    private

    def xlsx
      ::Assessments::Export::RawAndScoring.call!(assessment, campaign, scoring: true)
    end

    def file_name
      "assessment-#{assessment.id}-scoring-results.xlsx"
    end
  end
end
