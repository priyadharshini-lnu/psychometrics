# frozen_string_literal: true

module AdminJobs
  module SuperAdmin
    class AssessmentRawExport < BaseExportAssessment
      QUESTIONS = %w[ConstantSum GapAnalysis GraphicSlider HotSpot
                     MatrixTable MetaInfo MultipleChoice PickGroupRank
                     RankOrder SideBySide Slider TextEntry Timing FileUpload AudioResponse VideoResponse].freeze

      def initialize(_)
        super
        @scoring_export = job_record.operation == 'assessment_scoring_export'
      end

      private

      def headers
        result_details_header = [
          'Result ID', 'Project ID', 'Project Name', 'Campaign ID', 'Campaign Name',
          'Subject Name', 'Subject Email', 'Evaluator Name', 'Evaluator Email',
          'Relationship', 'Started At', 'Completed At', 'Norm', 'Status', 'Completion Reason'
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

      def data_row(user_result) # rubocop:disable Metrics/AbcSize
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
          user_result.campaign.project.id,
          user_result.campaign.project.name,
          user_result.campaign.id,
          user_result.campaign.name,
          user_name(user_result.subject.first_name, user_result.subject.last_name),
          user_result.subject.email,
          user_name(user_result.evaluator.first_name, user_result.evaluator.last_name),
          user_result.evaluator.email,
          user_result.user_assessment.relationship.name,
          user_result.user_assessment.started_at.to_s,
          user_result.completed_at.to_s,
          user_result.norm ? user_result.norm.name : nil,
          I18n.t("activerecord.attributes.users_result.statuses.#{user_result.real_status}"),
          completion_reason,
          *answers
        ]
      end

      def records_for_export
        query = UsersResult.joins(:user_assessment).
                where(user_assessments: { assessment_id: assessment.id, status: :completed })

        if campaign_ids.present?
          query = query.where(user_assessments: { campaign_id: campaign_ids })
        end
        query.includes(:norm, :subject, :evaluator, user_assessment: %i[relationship]).
          find_each(batch_size: 100)
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
          "assessment-#{assessment.id}-scoring-results-#{record.id}.csv"
        else
          "assessment-#{assessment.id}-raw-results-#{record.id}.csv"
        end
      end
    end
  end
end
