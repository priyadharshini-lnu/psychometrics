# frozen_string_literal: true

module UsersResults
  module Scoring
    class MergeAIScores < BaseCommand
      private_attr_reader :users_result, :rescore, :user_assessment, :skip_post_scoring_tasks

      def initialize(users_result, rescore: false, skip_post_scoring_tasks: false)
        @users_result = users_result
        @rescore = rescore
        @skip_post_scoring_tasks = skip_post_scoring_tasks
        @user_assessment = users_result.user_assessment
      end

      def call
        return broadcast :ok, scoring unless user_assessment_approved?
        return broadcast :ok, scoring if ai_scores.empty?

        merge_scores!
        handle_post_scoring_tasks! unless skip_post_scoring_tasks

        broadcast :ok, users_result.scoring
      rescue StandardError => e
        broadcast :error, e.message
      end

      private

      def user_assessment_approved?
        return true if user_assessment.approval_status == 'approver_approved'

        user_assessment.approval_status == 'auto_approved' && !user_assessment.has_ai_scoring_approval_flow?
      end

      def handle_post_scoring_tasks!
        UserAssessments::PostScoringTasks.call!(user_assessment, nil, rescore: rescore)
      end

      def merge_scores!
        combined_scoring_map = merge_scoring

        final_scoring = ::UsersResults::Scoring::Extend.call!(
          dimension: users_result.assessment.dimension,
          scoring: combined_scoring_map,
          norm_data: users_result.norm_data,
          answers: users_result.answers,
          external_results: users_result.external_results || {}
        )

        users_result.update!(scoring: final_scoring)
      end

      def scoring
        @scoring ||= users_result.scoring || {}
      end

      def ai_scores
        @ai_scores ||= ::AI::FactorScore.
                       where(users_result: users_result, status: :approver_approved).
                       includes(:factor)
      end

      def ai_scoring_map
        @ai_scoring_map ||= build_ai_scoring_map
      end

      def build_ai_scoring_map
        map = Hash.new { |h, k| h[k] = { 'results' => [] } }

        ai_scores.each do |record|
          next if record.question_id.nil?

          factor_id = record.factor_id.to_s

          map[factor_id]['results'] << {
            'value' => record.final_score.to_f,
            'question_id' => record.question_id,
            'max_value' => record.factor.scale_max || 5.0,
            'value_sum' => record.final_score.to_f,
            'ai_metadata' => {
              'confidence' => record.confidence,
              'citations' => sanitized_citations(record.citations),
              'rationale' => record.rationale
            }
          }
        end

        map
      end

      def merge_scoring
        combined = scoring.deep_dup

        ai_scoring_map.each do |factor_id, ai_data|
          if combined[factor_id].present?
            existing_results = combined[factor_id]['results'] || []
            combined[factor_id]['results'] = merge_results(existing_results, ai_data['results'])
          else
            combined[factor_id] = { 'results' => ai_data['results'] }
          end
        end

        combined.each_value { |data| data.delete('score') }
      end

      def merge_results(existing_results, ai_results)
        ai_results_by_question = ai_results.index_by { |r| r['question_id'] }
        non_duplicate_existing = existing_results.reject do |result|
          ai_results_by_question.key?(result['question_id'])
        end

        non_duplicate_existing + ai_results
      end

      def sanitized_citations(citations)
        Array.wrap(citations).map do |citation|
          next citation unless citation.is_a?(Hash)

          {
            'text' => citation['text'],
            'sentiment' => citation['sentiment']
          }.compact
        end
      end
    end
  end
end
