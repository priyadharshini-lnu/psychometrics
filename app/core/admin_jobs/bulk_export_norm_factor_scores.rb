# frozen_string_literal: true

module AdminJobs
  class BulkExportNormFactorScores < BaseBulkExportFactorScores
    def valid?
      campaign.present? && selected_assessments.any? && start_date.present? && end_date.present?
    end

    def generate_title_link
      {
        href: "/admin/projects/#{campaign.project_id}/new_campaigns/#{campaign.id}/assessments_reports/manage",
        label: campaign.name.to_s
      }
    end

    def generate_details
      [[I18n.t('common.model.assessment'), file_link || I18n.t('admin.bulk_export_assessments_file')]]
    end

    private

    def export_file_key
      'norm_factor_scores'
    end

    def extra_headers
      ['Norm']
    end

    def extra_data(user_result)
      [user_result.norm&.name]
    end

    def score_field
      'norm_score'
    end
  end
end
