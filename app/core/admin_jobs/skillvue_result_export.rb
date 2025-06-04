# frozen_string_literal: true

module AdminJobs
  class SkillvueResultExport < BaseExportAssessment
    RESULT_HEADERS_DATA = %w[overallMatchPercentage].freeze

    private

    def headers
      [
        'Result ID', 'Subject Name', 'Subject Email', 'Evaluator Name', 'Evaluator Email',
        'Relationship', 'Started At', 'Completed At', 'Status', 'Overall Match Percentage'
      ]
    end

    def data_row(user_result)
      external_results = RESULT_HEADERS_DATA.map { |header| user_result.external_results&.dig(header) }

      [
        user_result.encoded_id,
        user_name(user_result.subject.first_name, user_result.subject.last_name),
        user_result.subject.email,
        user_name(user_result.evaluator.first_name, user_result.evaluator.last_name),
        user_result.evaluator.email,
        user_result.user_assessment.relationship.name,
        user_result.user_assessment.started_at.try(:strftime, '%D %r'),
        user_result.user_assessment.completed_at.try(:strftime, '%D %r'),
        I18n.t("activerecord.attributes.users_result.statuses.#{user_result.real_status}"),
        *external_results
      ]
    end

    def records_for_export
      UsersResult.joins(:user_assessment).
        where(user_assessments: { campaign_id: campaign.id, assessment_id: assessment.id }).
        includes(user_assessment: :evaluator)
    end

    def file_name
      "assessment-#{assessment.id}-external-results.csv"
    end
  end
end
