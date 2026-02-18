# frozen_string_literal: true

module AI
  module ContentAnalysis
    class SaveAIFactorScores < BaseCommand
      include Concerns::ScoringHelper
      include AdminJobs::Concerns::Syncable

      private_attr_reader :users_result, :assessment, :user_assessment, :rescore, :admin_job_record_id

      def initialize(users_result, rescore: false, admin_job_record_id: nil)
        @users_result = users_result
        @assessment = users_result.assessment
        @user_assessment = users_result.user_assessment
        @rescore = rescore
        @admin_job_record_id = admin_job_record_id
      end

      def call
        if sessions.empty?
          complete_admin_job!
          return broadcast :ok
        end

        ActiveRecord::Base.transaction do
          full_scoring_map.each do |factor_id, data|
            question_ids = factor_question_map[factor_id.to_s] || []
            persist_factor_scores(factor_id, data, question_ids)
          end
        end

        complete_admin_job!
        merge_scores_if_no_approval_flow!

        broadcast :ok
      rescue StandardError => e
        users_result.update!(ai_scoring_status: :failed)
        fail_admin_job!(["Failed to save AI scores for UsersResult #{users_result.id}: #{e.message}"])
        broadcast(:error, "Failed to save AI scores: #{e.message}")
      end

      private

      def sessions
        @sessions ||= AI::QuestionScoringSession.where(
          resource: users_result.user_assessment,
          assistable_type: 'Question',
          assistable_id: scorable_question_ids,
          status: :completed
        ).includes(:question)
      end

      def factor_ids_scope
        factor_ids = ai_scored_factors_by_id.keys
        @factor_ids_scope ||= (factor_ids + determine_all_ancestors(factor_ids)).uniq
      end

      def question_scores_map
        map = Hash.new { |h, k| h[k] = { 'results' => [] } }

        sessions.each do |session|
          session.scores.to_h.each do |factor_id, data|
            factor = ai_scored_factors_by_id[factor_id.to_i]
            next unless factor

            score = data['score'].to_f

            map[factor_id]['results'] << {
              'value' => score,
              'question_id' => session.assistable_id,
              'max_value' => factor.score_max || 5.0,
              'value_sum' => score,
              'ai_metadata' => {
                'confidence' => data['confidence'],
                'citations' => data['citations'],
                'rationale' => data['rationale']
              }
            }
          end
        end

        map
      end

      def ai_scored_factors_by_id
        @ai_scored_factors_by_id ||= begin
          factor_ids = sessions.flat_map { |s| s.scores.to_h.keys }.map(&:to_i).uniq
          Factor.where(id: factor_ids).index_by(&:id)
        end
      end

      def full_scoring_map
        calculate_extended_scoring(question_scores_map, factor_ids_scope)
      end

      def factor_question_map
        sessions.each_with_object(Hash.new { |h, k| h[k] = [] }) do |session, map|
          session.scores.to_h.each_key do |factor_id|
            map[factor_id.to_s] << session.assistable_id
          end
        end
      end

      def persist_factor_scores(factor_id, data, question_ids)
        if question_ids.any?
          factor = factors_by_id[factor_id.to_i]
          parent_factor_id = factor&.parent_factors&.first&.id
          persist_with_question_details(factor_id, data, question_ids, parent_factor_id)
        end
        persist_aggregated_score(factor_id, data['score'])
      end

      def persist_with_question_details(factor_id, data, question_ids, parent_factor_id)
        results = data['results'] || []

        results.each do |result|
          question_id = result['question_id']
          next unless question_ids.include?(question_id)

          ai_metadata = result['ai_metadata'] || {}

          upsert_factor_score(
            factor_id: factor_id,
            question_id: question_id,
            score: result['value'],
            confidence: ai_metadata['confidence'],
            citations: ai_metadata['citations'],
            rationale: ai_metadata['rationale'],
            parent_factor_id: parent_factor_id,
            scoring_type: :ai
          )
        end
      end

      def persist_aggregated_score(factor_id, score_value)
        upsert_factor_score(
          factor_id: factor_id,
          question_id: nil,
          score: score_value,
          confidence: nil,
          citations: nil,
          rationale: nil,
          parent_factor_id: nil,
          scoring_type: :aggregated
        )
      end

      def factors_by_id
        @factors_by_id ||= Factor.
                           where(id: factor_ids_scope).
                           includes(:parent_factors).
                           index_by(&:id)
      end

      def scorable_question_ids
        @scorable_question_ids ||= assessment.scorable_ai_questions.pluck(:id)
      end

      def merge_scores_if_no_approval_flow!
        return if user_assessment.has_ai_scoring_approval_flow?

        user_assessment.auto_approve_scoring!
        UsersResults::Scoring::MergeAIScores.call!(users_result, rescore: rescore)
      end
    end
  end
end
