# frozen_string_literal: true

module AI
  module ContentAnalysis
    class StaleChecker
      attr_reader :score_approval, :users_result

      def initialize(score_approval)
        @score_approval = score_approval
        @users_result = score_approval.users_result
      end

      def stale?
        return false if users_result.ai_scoring_approved?
        return false if completed_sessions.empty?

        completed_sessions.any? { |session| session_stale?(session) }
      end

      private

      def session_stale?(session)
        return false if session.content_checksum.blank?

        question = scorable_questions_by_id[session.assistable_id]
        return false unless question

        current_checksum = PayloadParser.new(question, users_result).dependencies_checksum
        session.content_checksum != current_checksum
      end

      def completed_sessions
        @completed_sessions ||= AI::QuestionScoringSession.where(
          resource: score_approval.as_user_assessment,
          assistable_type: 'Question',
          assistable_id: scorable_questions_by_id.keys,
          status: :completed
        )
      end

      def scorable_questions_by_id
        @scorable_questions_by_id ||= score_approval.assessment.
                                      scorable_ai_questions.
                                      includes(factors_scorings: { factor: :parent_factors }).
                                      index_by(&:id)
      end
    end
  end
end
