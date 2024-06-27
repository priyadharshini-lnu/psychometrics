# frozen_string_literal: true

module UsersResults
  module Scoring
    module AddScoreByStrategy
      class SubFactorsSum < BaseStrategy
        def call
          factor = factor_data[:factor]
          sub_factor_ids = factor_data[:sub_factor_hash].keys

          sub_extended_scoring =
            ::UsersResults::Scoring::AddScore.call!(
              factor_hash,
              sub_factor_ids,
              extended_scoring,
              norm,
              factor_norm_hash,
              external_results,
              factors_question_count
            )

          score =
            if sub_factor_ids.blank?
              nil
            else
              filtered_scoring = sub_extended_scoring.slice(*sub_factor_ids.map(&:to_s)).select do |_k, v|
                get_sub_factor_score(v)
              end
              calc_score(filtered_scoring)
            end

          broadcast :ok, sub_extended_scoring.deep_merge(factor.id.to_s => { 'score' => round_score(score, 2) })
        end

        def calc_score(scoring)
          score_data = scoring.each_with_object(sum: 0, count: 0) do |(k, v), data|
            weight = factor_data[:sub_factor_hash].try(:[], k.to_i).try(:[], :weight) || 1
            data[:sum] += get_sub_factor_score(v) * weight
            data[:count] += 1
          end
          return nil if score_data[:count].zero?

          score_data[:sum]
        end

        def get_sub_factor_score(value)
          factor_data[:factor].use_sub_factor_norm_score ? value['norm_score'] : value['score']
        end
      end
    end
  end
end
