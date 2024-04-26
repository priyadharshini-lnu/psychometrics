# frozen_string_literal: true

module AdminJobs
  module SuperAdmin
    class ExternalAssessmentExport < BaseExportXlsx
      def generate_details
        [['File', file_link]]
      end

      private

      def xlsx
        if assessment.hogan?
          ::SuperAdmin::ExportExternalAssessment::Hogan.call!(assessment, campaign_ids)
        elsif assessment.saville?
          ::SuperAdmin::ExportExternalAssessment::Saville.call!(assessment, campaign_ids)
        elsif assessment.iiht?
          ::SuperAdmin::ExportExternalAssessment::Iiht.call!(assessment, campaign_ids)
        elsif assessment.pearson?
          ::SuperAdmin::ExportExternalAssessment::Pearson.call!(assessment, campaign_ids)
        end
      end

      def file_name
        "assessment-#{assessment.id}-external-results-#{record.id}.xlsx"
      end

      def assessment
        @assessment ||= Assessment.find_by(id: record.data['assessment_id'])
      end
    end
  end
end
