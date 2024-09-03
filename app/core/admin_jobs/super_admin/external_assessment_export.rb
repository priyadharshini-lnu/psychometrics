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
          ::SuperAdmin::ExportExternalAssessment::Hogan.call!(users_results, assessment)
        elsif assessment.saville?
          ::SuperAdmin::ExportExternalAssessment::Saville.call!(users_results, assessment)
        elsif assessment.iiht?
          ::SuperAdmin::ExportExternalAssessment::Iiht.call!(users_results, assessment)
        elsif assessment.pearson?
          ::SuperAdmin::ExportExternalAssessment::Pearson.call!(users_results, assessment)
        end
      end

      def users_results
        query = UsersResult.joins(:user_assessment).
                where(user_assessments: { assessment_id: assessment.id }).
                merge(UserAssessment.scored).
                includes(campaign: :project, user_assessment: :subject)
        return query if campaign_ids.blank?

        query.where(user_assessments: { campaign_id: campaign_ids })
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
