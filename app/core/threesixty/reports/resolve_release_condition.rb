# frozen_string_literal: true

module Threesixty
  module Reports
    class ResolveReleaseCondition < BaseCommand
      attr_reader :campaign, :subject, :options

      def initialize(subject, options, subject_evaluator_counters)
        @options = options
        @subject = subject
        @subject_evaluator_counters = subject_evaluator_counters
      end

      def call
        broadcast :ok, Threesixty::NestedConditionResolver.call!(conditions, proc { |condition| resolve_condition(condition) })
      end

      def resolve_condition(condition)
        operator = condition['operator']
        relationship = condition['relationship']
        number_of_evaluator = condition['number_of_evaluator'].to_i
        {operator: operator, result: evaluators_by_relationship(relationship) >= number_of_evaluator}
      end

      def evaluators_by_relationship(relationship)
        @subject_evaluator_counters[relationship] || 0
      end

      private

      def conditions
        @options.reports['availability']['conditions']
      end
    end
  end
end
