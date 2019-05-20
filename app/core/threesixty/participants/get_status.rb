# frozen_string_literal: true

module Threesixty
  module Participants
    class GetStatus < BaseCommand
      NOT_COMPLETED = 'not_completed'
      COMPLETED = 'completed'

      def initialize(evaluator, subject, option, nomination_requirement, counters = {})
        @evaluator = evaluator
        @subject = subject
        @counters = counters
        @option = option || Threesixty::Option.new
        @nomination_requirement = nomination_requirement
      end

      def call
        return broadcast :ok, COMPLETED if !evaluator && valid_nomination_requirements?

        return broadcast :ok, NOT_COMPLETED unless evaluator

        return broadcast :ok, status_by_evaluator_data unless subject

        return broadcast :ok, NOT_COMPLETED if status_by_evaluator_data == NOT_COMPLETED

        return broadcast :ok, COMPLETED if valid_nomination_requirements?

        broadcast :ok, NOT_COMPLETED
      end

      def valid_nomination_requirements?
        return true unless nomination_requirement

        field = option.participants.dig('manager', 'can_approves_evaluations') ? :approved_evaluators_count : :completed_evaluators_count
        subjects_relationship_map = subject.subjects_relationships.index_by(&:relationship_id)

        nomination_requirement.conditions.all? do |condition|
          subjects_relationship = subjects_relationship_map[condition['relationship_id']]
          # TODO: (atanych): update this logic after nomination requirements implementation
          condition['value'] <= (subjects_relationship&.public_send(field) || 0)
        end
      end

      def status_by_evaluator_data
        return COMPLETED if counters[:completed_evaluations] == counters[:total_evaluations]

        NOT_COMPLETED
      end

      private

      attr_reader :evaluator, :subject, :option, :nomination_requirement, :counters
    end
  end
end
