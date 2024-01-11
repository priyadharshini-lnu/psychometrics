# frozen_string_literal: true

module AdminJobs
  class BaseExportAssessment < BaseExportCsv
    def valid?
      campaign.present? && assessment.present?
    end

    def generate_title_link
      {
        href: "/admin/projects/#{campaign.project_id}/new_campaigns/#{campaign.id}/assessments_reports/manage",
        label: "#{campaign.name} - #{assessment.name}"
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
