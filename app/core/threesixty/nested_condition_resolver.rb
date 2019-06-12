# frozen_string_literal: true

module Threesixty
  class NestedConditionResolver < BaseCommand
    attr_reader :conditions, :single_condition_resolver

    def initialize(conditions, single_condition_resolver)
      @conditions = conditions
      @single_condition_resolver = single_condition_resolver
    end

    def call
      broadcast :ok, resolve_conditions
    end

    def resolve_conditions
      results = conditions.map do |condition|
        second_results = condition['conditions'].map{ |cond| resolve_condition(cond) }
        {operator: condition['operator'], result: check_results(second_results)}
      end
      check_results(results)
    end

    def check_results(results)
      results.reduce(true) do |result, res|
        case res[:operator]
          when 'if'
            res[:result]
          when 'and'
            result && res[:result]
          when 'or'
            result || res[:result]
        end
      end
    end

    def resolve_condition(condition)
      single_condition_resolver.call(condition)
    end
  end
end
