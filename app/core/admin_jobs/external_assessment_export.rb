# frozen_string_literal: true

module AdminJobs
  class ExternalAssessmentExport < BaseExportAssessment
    private

    def xlsx
      if assessment.mindmill?
        ::Assessments::Export::Mindmill.call!(assessment, campaign)
      elsif assessment.hogan?
        ::Assessments::Export::Hogan.call!(assessment, campaign)
      elsif assessment.saville?
        ::Assessments::Export::Saville.call!(assessment, campaign)
      elsif assessment.iiht?
        ::Assessments::Export::Iiht.call!(assessment, campaign)
      end
    end

    def file_name
      "assessment-#{assessment.id}-external-results.xlsx"
    end
  end
end
