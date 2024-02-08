# frozen_string_literal: true

module UsersResults
  module Scoring
    module AddScoreByStrategy
      class CustomFormula < BaseStrategy
        def call
          factor = factor_data[:factor]
          lua = define_lua_context
          score = eval_lua(lua, factor.custom_formula)
          lua.close

          broadcast(:ok, extended_scoring.deep_merge(factor.id.to_s => { 'score' => score.nil? ? nil : score.to_i }))
        end

        private

        def define_lua_context
          lua = Rufus::Lua::State.new
          lua.eval('assessment, datasheet, user = {}, {}, {}')

          lua.function 'assessment.norm_score' do |factor_id|
            get_score(factor_id, 'norm_score')
          end

          lua.function 'assessment.raw_score' do |factor_id|
            get_score(factor_id, 'score')
          end

          lua.function 'assessment.zscore' do |factor_id|
            get_score(factor_id, 'zscore')
          end

          lua.function 'assessment.percentage_answered' do |factor_id|
            get_score(factor_id, 'percentage')
          end

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
        rescue Rufus::Lua::LuaError
          nil
        end
      end
    end
  end
end
