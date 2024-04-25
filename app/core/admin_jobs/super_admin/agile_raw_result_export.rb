# frozen_string_literal: true

module AdminJobs
  module SuperAdmin
    class AgileRawResultExport < BaseExportAssessment
      FIXED_HEADERS = [
        'ID',
        'Project ID',
        'Project Name',
        'Campaign ID',
        'Campaign Name',
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
          user_result.campaign.project.id,
          user_result.campaign.project.name,
          user_result.campaign.id,
          user_result.campaign.name,
          user_result.subject.first_name,
          user_result.subject.last_name,
          user_result.subject.email,
          @assessment.id,
          @assessment.name,
          I18n.t("activerecord.attributes.users_result.statuses.#{user_result.real_status}", locale: :en),
          user_result.started_at.to_s,
          user_result.completed_at.to_s,
          user_result.meta_data['completed_groups']&.join(','),
          user_result.norm ? user_result.norm.name : nil,
          *answer_values
        ]
      end

      def records_for_export
        query = UsersResult.joins(:user_assessment).
                where(
                  user_assessments: { assessment_id: assessment.id, status: :completed }
                )
        if campaign_ids.present?
          query = query.where(user_assessments: { campaign_id: campaign_ids })
        end
        query.includes(:norm, :subject, :evaluator, user_assessment: %i[relationship]).
          find_each(batch_size: 100)
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
                     collect { |question| question['id'] }
      end

      def readable_date(timestamp)
        if timestamp.present?
          DateTime.strptime(timestamp.to_s, '%Q').to_s
        else
          ''
        end
      end

      def file_name
        "assessment-#{assessment.id}-raw-results-#{record.id}.csv"
      end
    end
  end
end
