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
            'percentage_answered' => proc { |factor_id| get_score(factor_id, 'percentage') },
            'answer' => proc { |json_path| answer_from_json_path(json_path) }
          }
          lua.helpers = {
            'round' => proc { |value, precision = 0| round_value(value, precision) },
            'percentile' => proc { |value| Ztable.percentile(value) },
            'average' => proc { |values, precision = nil| calculate_average(values, precision) }
          }
          lua
        end

        def get_score(factor_id, score_type)
          factor_id = factor_id.to_i
          score = extended_scoring.dig(factor_id.to_s, score_type)
          return score if score

          factor_data = factor_hash[factor_id]
          return nil if factor_data.nil?

          @extended_scoring = ::UsersResults::Scoring::AddScore.call!({
            factor_hash: factor_hash,
            factor_ids: [factor_id],
            scoring: extended_scoring,
            norm: norm,
            factor_norm_hash: factor_norm_hash,
            external_results: external_results,
            answers: answers,
            factors_question_count: factors_question_count,
            visited_factor_ids: visited_factor_ids
          })

          extended_scoring.dig(factor_id.to_i.to_s, score_type)
        end

        def answer_from_json_path(json_path)
          JsonPath.new(json_path).on(answers).first
        end

        def round_value(value, precision)
          numeric_value = coerce_numeric_value(value)
          return nil if numeric_value.nil?

          numeric_value.round(precision)
        end

        def coerce_numeric_value(value)
          return value if value.is_a?(Numeric)
          return nil if value.nil?

          raise 'helpers.round: First parameter must be numeric.'
        end

        def calculate_average(values, precision)
          unless values.is_a?(Lua::Table)
            raise 'helpers.average: First parameter must be a Lua table, and second parameter is precision (integer)'
          end

          values_array = values.to_a
          average = values_array.sum / values_array.size.to_f
          precision.nil? ? average : average.round(precision)
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
