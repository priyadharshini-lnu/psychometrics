# frozen_string_literal: true

module AdminJobs
  class CompletionStatusExport < BaseExportCsv
    def generate_details
      [[I18n.t('common.model.completion_statuses'), file_link]]
    end

    private

    def headers
      [
        'Result ID',
        'Subject Name',
        'Subject Email',
        'Evaluator Name',
        'Evaluator Email',
        'Assessment Type',
        'Assessment Name',
        'Started At',
        'Completed At',
        'Status'
      ]
    end

    def records_for_export
      UserAssessment.where(campaign_id: record.data['campaign_id']).
        includes(:users_result, :evaluator, :assessment)
    end

    def data_row(user_assessment)
      user_result = user_assessment.users_result
      [
        user_result.encoded_id,
        user_assessment.subject.decorate.full_name,
        user_assessment.subject.email,
        user_assessment.evaluator.decorate.full_name,
        user_assessment.evaluator.email,
        user_assessment.assessment.decorate.category,
        user_assessment.assessment.name,
        user_result.decorate.started_at_with_time,
        user_result.decorate.completed_at_with_time,
        user_result.decorate.status
      ]
    end

    def file_name
      'detailed-completion-statuses.csv'
    end
  end
end
