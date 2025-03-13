# frozen_string_literal: true

module AdminJobs
  class AgileRawResultExport < BaseExportAssessment
    FIXED_HEADERS = [
      'ID',
      'First Name',
      'Last Name',
      'Email',
      'Assessment ID',
      'Assessment Name',
      'Status',
      'Started At',
      'Completed At',
      'Completed Groups',
      'Norm'
    ].freeze

    private

    def headers
      question_headers = questions.map do |q|
        [
          "#{q}.group_id",
          "#{q}.id",
          "#{q}.answers",
          "#{q}.duration",
          "#{q}.session_id",
          "#{q}.start_time",
          "#{q}.end_time"
        ]
      end.flatten
      FIXED_HEADERS + question_headers
    end

    def data_row(user_result)
      answer = user_result.answers || {}
      answers_by_id = answer.inject({}) { |obj, group| obj.merge(group['answers']) }
      answer_values = questions.map do |question|
        [
          answers_by_id.dig(question, 'group_id'),
          answers_by_id.dig(question, 'id'),
          answers_by_id.dig(question, 'answers')&.join(','),
          answers_by_id.dig(question, 'duration'),
          answers_by_id.dig(question, 'session_id'),
          readable_date(answers_by_id.dig(question, 'start_time')),
          readable_date(answers_by_id.dig(question, 'end_time'))
        ]
      end.flatten

      [
        user_result.encoded_id,
        user_result.subject.first_name,
        user_result.subject.last_name,
        user_result.subject.email,
        @assessment.id,
        @assessment.name,
        I18n.t("activerecord.attributes.users_result.statuses.#{user_result.real_status}", locale: :en),
        user_result.started_at.to_s,
        user_result.completed_at.to_s,
        user_result.meta_data['completed_groups']&.join(','),
        user_result.norm&.name,
        *answer_values
      ]
    end

    def records_for_export
      users_results = UsersResult.joins(:user_assessment).
                      where(user_assessments: { assessment_id: assessment.id, campaign_id: campaign.id }).
                      where.not(user_assessments: { status: :not_started }).
                      includes(:norm, :subject, :evaluator, user_assessment: [:relationship])

      unless include_inactive_users
        users_results = users_results.joins(
          'INNER JOIN campaign_users ON campaign_users.user_id = user_assessments.subject_id AND
           campaign_users.campaign_id = user_assessments.campaign_id'
        ).where(campaign_users: { active: true })
      end

      users_results.find_each(batch_size: 100)
    end

    def questions
      return @questions if defined?(@questions)

      config = Agile.find_by(assessment_id: assessment.id).try(:config)
      @questions = config['groups'].collect do |group|
                     group['scenes'].select { |scene| scene['type'] == 'AssessmentScene' }
                   end.
                   select { |scene| scene.size.positive? }.
                   flatten(1).
                   flat_map { |scene| scene.dig('data', 'blocks') }.
                   flat_map { |blocks| blocks['questions'] }.
                   pluck('id')
    end

    def readable_date(timestamp)
      if timestamp.present?
        DateTime.strptime(timestamp.to_s, '%Q').to_s
      else
        ''
      end
    end

    def file_name
      if job_record.data['export_with_labels'].present?
        "assessment-#{assessment.id}-raw-with-labels.csv"
      else
        "assessment-#{assessment.id}-raw-without-labels.csv"
      end
    end

    def include_inactive_users
      record.data['include_inactive_users'] || false
    end
  end
end
