# frozen_string_literal: true

module Threesixty
  module Reports
    class ResolveReleaseCondition < BaseCommand
      attr_reader :campaign, :subject, :options

      def initialize(campaign, subject)
        @campaign = campaign
        @options = @campaign.option
        @subject = subject
        @evaluations = @campaign.participants.evaluator_nomination_completed
                                .where(subject_id: subject.user_id)
      end

      def call
        broadcast :ok, resolve_conditions
      end

      def resolve_conditions
        results = conditions.map do |condition|
          if condition['conditions']
            second_results = condition['conditions'].map{ |cond| resolve_condition(cond) }
            {operator: condition['operator'], result: check_results(second_results)}
          else
            resolve_condition(condition)
          end
        end
        check_results(results)
      end

      def check_results(results)
        return results[0][:result] if results.size == 1
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
        operator = condition['operator']
        relationship = condition['relationship']
        number_of_evaluator = condition['number_of_evaluator'].to_i
        {operator: operator, result: evaluators_by_relationship(relationship) >= number_of_evaluator}
      end

      def grouped_evaluators
        @grouped_evaluators ||= @evaluations.joins(:relationship).group('relationships.name').count
      end

      def evaluators_by_relationship(relationship)
        grouped_evaluators[relationship] || 0
      end

      private

      def conditions
        @options.reports['availability']['conditions']
      end
    end
  end
end
