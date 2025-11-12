# frozen_string_literal: true

module AdminJobs
  module SuperAdmin
    class BaseExportAssessment < BaseExportCsv
      def valid?
        assessment.present? && assessment.dimension.present?
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

      def disable_data_processing?
        client = assessment.owner
        project = assessment.project

        client&.client_privacy_setting&.disable_data_processing ||
          project&.privacy_setting&.disable_data_processing
      end

      def filtered_project_ids
        @filtered_project_ids ||= Project.joins(join_clauses).where(privacy_conditions).pluck(:id)
      end

      def filtered_campaign_ids
        @filtered_campaign_ids ||= if campaign_ids.present?
                                     Campaign.where(id: campaign_ids, project_id: filtered_project_ids).pluck(:id)
                                   else
                                     Campaign.where(project_id: filtered_project_ids).pluck(:id)
                                   end
      end

      def join_clauses
        <<-SQL.squish
          LEFT JOIN clients parent_clients ON clients.ancestry = parent_clients.id::text
          LEFT JOIN privacy_settings ON privacy_settings.project_id = clients.id
          LEFT JOIN client_privacy_settings ON client_privacy_settings.client_id = parent_clients.id
        SQL
      end

      def privacy_conditions
        <<~SQL.squish
          COALESCE(privacy_settings.disable_data_processing, FALSE) = FALSE
          AND COALESCE(client_privacy_settings.disable_data_processing, FALSE) = FALSE
        SQL
      end
    end
  end
end
