# frozen_string_literal: true

module AdminJobs
  class ProjectCompletionStatusExport < BaseExportCsv
    def generate_details
      [[I18n.t('common.model.completion_statuses'), file_link]]
    end

    private

    def headers
      [
        'Result ID',
        'Subject Name',
        'Subject Email',
        'Campaign ID',
        'Campaign Name',
        'Evaluator Name',
        'Evaluator Email',
        'Assessment Type',
        'Assessment Name',
        'Started At',
        'Completed At',
        'Completion Code',
        'Status'
      ]
    end

    def records_for_export
      user_assessments = UserAssessment.
                         joins(:campaign).
                         where(campaigns: { project_id: record.data['project_id'] }).
                         includes(:users_result, :evaluator, :assessment)

      unless include_inactive_users
        user_assessments = user_assessments.left_joins(:campaign_user).
                           where('campaign_users.active = ? OR campaign_users.id IS NULL', true).
                           where('campaign_users.campaign_id = user_assessments.campaign_id').
                           distinct
      end

      user_assessments.find_each(batch_size: 1000)
    end

    def data_row(user_assessment)
      user_result = user_assessment.users_result
      [
        user_result&.encoded_id,
        user_assessment.subject.decorate.full_name,
        user_assessment.subject.email,
        user_assessment.campaign_id,
        user_assessment.campaign.name,
        user_assessment.evaluator.decorate.full_name,
        user_assessment.evaluator.email,
        user_assessment.assessment.decorate.category,
        user_assessment.assessment.name,
        user_result&.decorate&.started_at_with_time,
        user_result&.decorate&.completed_at_with_time,
        user_result&.completion_status_code,
        user_result&.decorate&.status
      ]
    end

    def file_name
      'project-detailed-completion-statuses.csv'
    end

    def include_inactive_users
      record.data['include_inactive_users'] || false
    end
  end
end
