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
        broadcast :ok, Threesixty::NestedConditionResolver.call!(conditions, proc { |condition| resolve_condition(condition) })
      end

      def resolve_condition(condition)
        operator = condition['operator']
        relationship = condition['relationship']
        number_of_evaluator = condition['number_of_evaluator'].to_i
        {operator: operator, result: evaluators_by_relationship(relationship) >= number_of_evaluator}
      end

      def grouped_evaluators
        @grouped_evaluators ||= @evaluations.joins(:relationship).group('relationships.id').count
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
