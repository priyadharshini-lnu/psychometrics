# frozen_string_literal: true

module AdminJobs
  class AssessmentRawExport < BaseExportAssessment
    QUESTIONS = %w[ConstantSum GapAnalysis GraphicSlider HotSpot
                   MatrixTable MetaInfo MultipleChoice PickGroupRank
                   RankOrder SideBySide Slider TextEntry Timing FileUpload
                   AudioResponse VideoResponse FactorSelect CampaignFactorFeedback].freeze

    def initialize(_, _stage = nil)
      super
      @scoring_export = job_record.operation == 'assessment_scoring_export'
    end

    private

    def headers
      result_details_header = [
        'Result ID', 'Subject Name', 'Subject Email', 'Evaluator Name', 'Evaluator Email',
        'Relationship', 'Started At', 'Completed At', 'Completion Code', 'Norm', 'Status', 'Completion Reason'
      ]
      question_name_header = [''] * result_details_header.count
      question_text_header = question_name_header.clone
      question_choice_header = question_name_header.clone

      questions.each do |question|
        next unless QUESTIONS.include?(question.type)

        parser = "Exports::Assessments::Questions::#{question.type}".constantize
        headers = parser.headers(question)

        result_details_header.concat(headers[:question_id_header])
        question_name_header.concat(headers[:question_name_header])
        question_text_header.concat(headers[:question_text_header])
        question_choice_header.concat(headers[:question_choice_header])
      end
      [result_details_header, question_name_header, question_text_header, question_choice_header]
    end

    def data_row(user_result)
      answers = []
      if user_result.answers
        questions.each do |question|
          next unless QUESTIONS.include?(question.type)

          parser = "Exports::Assessments::Questions::#{question.type}".constantize
          answers << parser.result(user_result, question, @scoring_export, job_record.data['export_with_labels'])
        end
      end

      answers = answers.map { |a| a == [] ? '' : a }.flatten

      if user_result.completion_reason
        completion_reason = I18n.t(
          "activerecord.attributes.users_result.completion_reasons.#{user_result.completion_reason}"
        )
      end

      [
        user_result.encoded_id,
        user_name(user_result.subject.first_name, user_result.subject.last_name),
        user_result.subject.email,
        user_name(user_result.evaluator.first_name, user_result.evaluator.last_name),
        user_result.evaluator.email,
        user_result.user_assessment.relationship.name,
        user_result.user_assessment.started_at.to_s,
        user_result.completed_at.to_s,
        user_result.completion_status_code,
        user_result.norm&.name,
        I18n.t("activerecord.attributes.users_result.statuses.#{user_result.real_status}"),
        completion_reason,
        *answers
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
      @questions ||= Question.
                     joining { block }.
                     not_deleted.
                     includes(:factors_scorings).
                     selecting { [id, name, type, props] }.
                     where.has { |q| q.block.assessment_id == assessment.id }.
                     ordering { [block.position.asc, position.asc] }
    end

    def file_name
      if @scoring_export
        "assessment-#{assessment.id}-scoring-results.csv"
      else
        "assessment-#{assessment.id}-raw-results.csv"
      end
    end

    def include_inactive_users
      record.data['include_inactive_users'] || false
    end
  end
end
