# frozen_string_literal: true

module Threesixty
  module Reports
    class ResolveReleaseCondition < BaseCommand
      attr_reader :campaign, :subject, :options

      def initialize(subject, options, subject_evaluator_counters, not_available_details: false)
        @options = options
        @subject = subject
        @subject_evaluator_counters = subject_evaluator_counters
        @not_available_details = not_available_details
        @failed_conditions = []
      end

      def call
        result = Threesixty::NestedConditionResolver.call!(
          conditions, proc { |condition| resolve_condition(condition) }
        )

        if @not_available_details && !result
          broadcast :ok, { result: result, failed_conditions: @failed_conditions }
        else
          broadcast :ok, result
        end
      end

      def resolve_condition(condition)
        operator = condition['operator']
        relationship = condition['relationship']
        number_of_evaluator = condition['number_of_evaluator'].to_i
        actual_evaluators = evaluators_by_relationship(relationship)
        condition_met = actual_evaluators >= number_of_evaluator

        if @not_available_details && !condition_met
          relationship_name = get_relationship_name(relationship)
          @failed_conditions << {
            relationship: relationship_name,
            required: number_of_evaluator,
            actual: actual_evaluators,
            operator: operator
          }
        end

        { operator: operator, result: condition_met }
      end

      def evaluators_by_relationship(relationship)
        @subject_evaluator_counters[relationship] || 0
      end

      def get_relationship_name(relationship_id)
        relationship = Relationship.find_by(id: relationship_id)
        relationship&.name || relationship_id.to_s
      end

      private

      def conditions
        @options.reports['availability']['conditions']
      end
    end
  end
end
