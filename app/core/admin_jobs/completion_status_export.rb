# frozen_string_literal: true

module AdminJobs
  class CompletionStatusExport < BaseExportCsv
    def generate_details
      [[I18n.t('common.model.completion_statuses'), file_link]]
    end

    private

    def locals
      {
        user_assessments: UserAssessment.where(campaign_id: record.data['campaign_id']).
          includes(:users_result, :evaluator, :assessment),
        headers: UsersResultDecorator.export_headers
      }
    end

    def csv_template
      'administration/campaigns/users/export_completion_status.csv.am'
    end

    def file_name
      'completion-statuses.csv'
    end
  end
end
