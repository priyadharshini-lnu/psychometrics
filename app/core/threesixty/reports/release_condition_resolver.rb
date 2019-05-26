# frozen_string_literal: true

module Threesixty
  module Reports
    class ReleaseConditionResolver < BaseCommand
      attr_reader :campaign, :subject, :options

      def initialize(campaign, subject)
        @campaign = campaign
        @options = @campaign.option
        @subject = subject
        @evaluations = @campaign.participants.where(subject_id: subject.user_id, evaluator_nomination_status: :completed)
      end

      def call
        broadcast :ok, resolve_conditions
      end

      def resolve_conditions
        results = conditions.map do |condition|
          if condition['conditions']
            second_results = condition['conditions'].map{ |cond| resolve_condition(cond) }
            {type: condition['operator'], result: check_results(second_results)}
          else
            resolve_condition(condition)
          end
        end
        check_results(results)
      end

      def check_results(results)
        return results[0][:result] if results.size == 1
        result = true
        results.each do |res|
          result = res[:result] if res[:type] == 'if'
          result = result && res[:result] if res[:type] == 'and'
          result = result || res[:result] if res[:type] == 'or'
        end
        result
      end

      def resolve_condition(condition)
        type = condition['type']
        operator = condition['operator']
        relationship = condition['relationship']
        number_of_evaluator = condition['number_of_evaluator'].to_i
        {type: operator, result: evaluators_by_relationship(relationship) >= number_of_evaluator}
      end

      def evaluators_by_relationship(relationship)
        @evaluations.joins(:relationship).where(relationships: {name: relationship})
                    .evaluator_nomination_completed.count
      end

      private

      def conditions
        @options.reports['availability']['conditions']
      end
    end
  end
end
