# frozen_string_literal: true

module AdminJobs
  class ExportReportsAndAssessments < ::AdminJobs::BaseExportCsv
    include ActionView::Helpers::TagHelper
    include ActionView::Context

    def generate_details
      [[I18n.t('frontend.campaign.users.actions.export_reports_and_assessments.details'), file_link]]
    end

    def headers
      CampaignUsers::AssignReportsAndAssessments::ParseImportData::HEADER_IMPORT_KEYS
    end

    def records_for_export
      campaign.campaign_users.includes(:user, :user_assessments, user_reports: :report).find_each(batch_size: 100)
    end

    def data_row(campaign_user)
      campaign_user.user_reports.filter_map do |user_report|
        user_report.report.assessments.filter_map do |assessment|
          user_assessment = campaign_user.user_assessments.find_by(assessment_id: assessment.id)
          next unless user_assessment

          [
            campaign_user.user.email,
            user_report.report_family_id,
            user_report.report_id,
            user_assessment.assessment_id,
            user_assessment.norm_id
          ]
        end
      end.flatten(1)
    end

    def file_name
      "#{campaign.name}_reports_and_assessments.csv"
    end

    def valid?
      campaign.present?
    end
  end
end
