# frozen_string_literal: true

module AI
  module ContentAnalysis
    class UpdateDependentFactorScores < BaseCommand
      include Concerns::ScoringHelper

      private_attr_reader :updated_records, :users_result, :assessment, :user_assessment

      def initialize(updated_records)
        @updated_records = Array.wrap(updated_records)
        @users_result = @updated_records.first&.users_result
        @assessment = users_result&.assessment
        @user_assessment = users_result&.user_assessment
      end

      def call
        return broadcast :error, 'No records provided' if updated_records.empty?
        return broadcast :error, 'Users result not found' unless users_result

        recalculated_scoring_map = build_recalculated_scoring

        return broadcast :ok, [] unless recalculated_scoring_map

        updated_factor_scores = ActiveRecord::Base.transaction do
          persist_aggregated_scores(recalculated_scoring_map)
        end

        broadcast :ok, updated_factor_scores
      rescue StandardError => e
        broadcast :error, "Failed to update dependent scores: #{e.message}"
      end

      private

      def build_recalculated_scoring
        updated_factor_ids = updated_records.map(&:factor_id).uniq

        all_ancestor_ids = determine_all_ancestors(updated_factor_ids)
        child_ids = determine_all_children(all_ancestor_ids)
        all_child_factor_ids = (updated_factor_ids + child_ids).uniq
        all_relevant_factor_ids = (all_child_factor_ids + all_ancestor_ids).uniq

        scoring_map = build_scoring_map(all_child_factor_ids)
        calculate_extended_scoring(scoring_map, all_relevant_factor_ids)
      end

      def build_scoring_map(all_child_factor_ids)
        scores = AI::FactorScore.
                 where(users_result: users_result, factor_id: all_child_factor_ids).
                 where.not(question_id: nil).
                 includes(:factor)

        scores.each_with_object(Hash.new { |h, k| h[k] = { 'results' => [] } }) do |score_record, map|
          factor_id_str = score_record.factor_id.to_s

          result_data = {
            'value' => score_record.final_score.to_f,
            'question_id' => score_record.question_id,
            'max_value' => score_record.factor.scale_max || 5.0,
            'value_sum' => score_record.final_score.to_f
          }

          map[factor_id_str]['results'] << result_data
        end
      end

      def persist_aggregated_scores(scoring_map)
        scoring_map.filter_map do |factor_id, data|
          score_value = data['score'] || data['value']
          next unless score_value

          persist_aggregated_score(factor_id, score_value)
        end
      end

      def persist_aggregated_score(factor_id, score_value)
        record = AI::FactorScore.find_or_initialize_by(
          users_result: users_result,
          factor_id: factor_id,
          question_id: nil
        )
        return if record.persisted? && record.score == score_value

        upsert_factor_score(
          factor_id: factor_id,
          question_id: nil,
          score: score_value,
          confidence: nil,
          citations: nil,
          rationale: nil,
          scoring_type: :aggregated
        )
      end
    end
  end
end
