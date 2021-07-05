# frozen_string_literal: true

module AdminJobs
  class AssessmentRawFactorExport < BaseExportAssessment
    private

    def xlsx
      ::Assessments::Export::RawFactorScores.call!(assessment, campaign)
    end

    def file_name
      "assessment-#{assessment.id}-raw-factor-scores.xlsx"
    end
  end
end
