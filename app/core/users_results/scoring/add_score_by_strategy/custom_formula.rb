# frozen_string_literal: true

module UsersResults
  module Scoring
    module AddScoreByStrategy
      class CustomFormula < BaseStrategy
        def call
          factor = factor_data[:factor]
          lua = define_lua_context(extended_scoring)
          setup_sandbox(lua)
          score = eval_lua(lua, factor.custom_formula)
          lua.close

          broadcast(:ok, extended_scoring.deep_merge(factor.id.to_s => { 'score' => score.nil? ? nil : score.to_i }))
        end

        private

        def define_lua_context(scoring)
          s = Rufus::Lua::State.new

          s.eval('assessment, datasheet, user = {}, {}, {}')

          s.function 'assessment.norm_score' do |factor_id|
            scoring.dig(factor_id.to_i.to_s, 'norm_score')
          end

          s.function 'assessment.raw_score' do |factor_id|
            scoring.dig(factor_id.to_i.to_s, 'results')
          end

          s.function 'assessment.zscore' do |factor_id|
            scoring.dig(factor_id.to_i.to_s, 'zscore')
          end

          s
        end

        def setup_sandbox(lua)
          lua.eval(%(
            arg=nil
            debug.debug=nil
            debug.getfenv=getfenv
            debug.getregistry=nil
            dofile=nil
            io={write=io.write}
            loadfile=nil
            os = {time = os.time}
            package.loaded.io=io
            package.loaded.package=nil
            package=nil
            require=nil
          ))
        end

        def eval_lua(lua, script)
          lua.eval(script)
        rescue Rufus::Lua::LuaError
          nil
        end
      end
    end
  end
end
