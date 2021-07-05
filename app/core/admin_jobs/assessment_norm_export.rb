# frozen_string_literal: true

module AdminJobs
  class AssessmentNormExport < BaseExportAssessment
    private

    def xlsx
      ::Assessments::Export::NormedResult.call!(assessment, campaign)
    end

    def file_name
      "assessment-#{assessment.id}-normed-results.xlsx"
    end
  end
end
