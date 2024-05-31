# frozen_string_literal: true

module UsersResults
  module Scoring
    module AddScoreByStrategy
      class CustomFormula < BaseStrategy
        def call
          factor = factor_data[:factor]
          lua = define_lua_context
          score = eval_lua(lua, factor.custom_formula)

          broadcast(:ok, extended_scoring.deep_merge(factor.id.to_s => { 'score' => round_score(score) }))
        end

        private

        def define_lua_context
          lua = Lua::State.new
          lua.assessment = {
            'norm_score' => proc { |factor_id| get_score(factor_id, 'norm_score') },
            'raw_score' => proc { |factor_id| get_score(factor_id, 'score') },
            'zscore' => proc { |factor_id| get_score(factor_id, 'zscore') },
            'percentage_answered' => proc { |factor_id| get_score(factor_id, 'percentage') }
          }
          lua
        end

        def get_score(factor_id, score_type)
          factor_id = factor_id.to_i
          score = extended_scoring.dig(factor_id.to_s, score_type)
          return score if score

          factor_data = factor_hash[factor_id]
          return nil if factor_data.nil?

          @extended_scoring = ::UsersResults::Scoring::AddScore.call!(
            factor_hash,
            [factor_id],
            extended_scoring,
            norm,
            factor_norm_hash,
            external_results,
            factors_question_count,
            visited_factor_ids
          )
          extended_scoring.dig(factor_id.to_i.to_s, score_type)
        end

        def eval_lua(lua, script)
          LuaEvaluator.eval(script, lua)
        rescue Lua::Exceptions::Base
          nil
        end
      end
    end
  end
end
