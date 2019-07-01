# frozen_string_literal: true

module Threesixty
  module NominationRequirements
    class IsValid < BaseCommand
      def initialize(nomination_requirement, counters)
        @nomination_requirement = nomination_requirement
        @counters = counters
      end

      def call
        return true unless nomination_requirement

        result =
          nomination_requirement.conditions.all? do |condition|
            condition['value'].nil? || condition['value'] <= (counters[condition['relationship_id']] || 0)
          end
        broadcast :ok, result
      end

      private

      attr_reader :nomination_requirement, :counters
    end
  end
end
