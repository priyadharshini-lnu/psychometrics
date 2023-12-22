# frozen_string_literal: true

module AdminJobs
  module SuperAdmin
    class BaseExportAssessment < BaseExportCsv
      def valid?
        assessment.present?
      end

      def generate_title_link
        {
          href: '/administration/assessments',
          label: assessment.name.to_s
        }
      end

      def generate_details
        [[I18n.t('common.model.assessment'), file_link || assessment.name]]
      end

      private

      def user_name(first_name, last_name)
        [first_name, last_name].compact_blank.join(', ')
      end

      def assessment
        @assessment ||= Assessment.find_by(id: record.data['assessment_id'])
      end
    end
  end
end
