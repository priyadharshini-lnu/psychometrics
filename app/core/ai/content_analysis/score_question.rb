# frozen_string_literal: true

module AI
  module ContentAnalysis
    class ScoreQuestion < BaseCommand
      include Concerns::TransientErrorHandler

      private_attr_reader :question, :users_result, :ai_assistant, :assessment,
                          :user_assessment, :rescore, :force_regenerate

      def initialize(question, users_result, rescore: false, force_regenerate: false)
        @question = question
        @users_result = users_result
        @user_assessment = users_result.user_assessment
        @assessment = users_result.assessment
        @ai_assistant = assessment.ai_assistant
        @rescore = rescore
        @force_regenerate = force_regenerate
      end

      def call
        prepare_session!

        unless should_regenerate?
          broadcast(:ok, session.scores)
          return
        end

        session.mark_as_in_progress!
        generate_scores!
      rescue StandardError => e
        handle_unexpected_error(e)
      end

      private

      def prepare_session!
        @session = find_or_create_session
        session.reset_for_rescore! if force_regenerate && session.persisted?
      end

      def generate_scores!
        assistant_service.
          on(:ok)    { |result| handle_success(result) }.
          on(:error) { |error, exception| handle_error(error, exception) }.
          call
      end

      def handle_success(result)
        parsed_scores = parse_ai_response(result[:message])

        if parsed_scores.empty?
          handle_error('AI response contained no valid factor scores')
          return
        end

        session.update!(
          checkpoint: parsed_scores,
          status: :completed,
          parsed_dependencies: current_dependencies,
          content_checksum: current_dependencies_checksum
        )
        broadcast(:ok, parsed_scores)
      end

      def handle_error(error_message, exception = nil)
        raise exception if transient_error?(exception)

        session.mark_as_failed!(error_message)
        broadcast(:error, error_message)
      end

      def handle_unexpected_error(error)
        error_msg = "#{error.class.name}: #{error.message}"
        session&.mark_as_failed!(error_msg)
        broadcast(:error, error_msg)
      end

      def assistant_service
        @assistant_service ||= AI::AssistantService.new(
          ai_assistant.id,
          users_result.user,
          payload_parser.scoring_context,
          chat: nil,
          contextual_information: payload_parser.assessment_level_instructions,
          validate_response_structure: true,
          response_validators: [indicator_completeness_validator],
          session: session
        )
      end

      def indicator_completeness_validator
        IndicatorCompletenessValidator.new(expected_indicator_ids)
      end

      def expected_indicator_ids
        question.factors_scorings.includes(:factor).map { |fs| fs.factor.id }
      end

      def payload_parser
        @payload_parser ||= PayloadParser.new(question, users_result)
      end

      def should_regenerate?
        return false if user_assessment.ai_scoring_approved?
        return true if force_regenerate
        return true if session.failed? || session.scores.blank?

        dependencies_changed?
      end

      def dependencies_changed?
        session.content_checksum != current_dependencies_checksum
      end

      def current_dependencies_checksum
        @current_dependencies_checksum ||= payload_parser.dependencies_checksum
      end

      def current_dependencies
        @current_dependencies ||= payload_parser.dependencies
      end

      def find_or_create_session
        AI::QuestionScoringSession.find_or_create_by!(
          assistable: question,
          resource: user_assessment,
          user: users_result.user
        )
      end

      def session
        @session ||= find_or_create_session
      end

      def parse_ai_response(response)
        return {} unless response.is_a?(Hash) && response['indicator_scores'].is_a?(Array)

        response['indicator_scores'].each_with_object({}) do |score_data, parsed|
          indicator_id = score_data['indicator_id']
          next if indicator_id.blank?

          parsed[indicator_id.to_s] = score_data.except('indicator_id')
        end
      end
    end
  end
end
