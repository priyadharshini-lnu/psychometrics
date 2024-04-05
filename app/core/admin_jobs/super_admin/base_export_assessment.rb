# frozen_string_literal: true

module AdminJobs
  module SuperAdmin
    class BaseExportAssessment < BaseExportCsv
      def valid?
        assessment.present?
      end

      def generate_title_link
        {
          href: '/admin/assessments',
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

      def campaign_ids
        return record.data['campaign_ids'] if record.data['campaign_ids'].present?

        if record.data['project_ids'].present?
          @campaign_ids ||= Campaign.where(project_id: record.data['project_ids']).pluck(:id)
        end
      end
    end
  end
end
