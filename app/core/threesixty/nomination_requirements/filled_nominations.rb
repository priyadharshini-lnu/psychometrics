# frozen_string_literal: true

module Threesixty
  module NominationRequirements
    class FilledNominations < BaseCommand
      attr_reader :users, :threesixty_campaign, :subject_conditions

      def initialize(subjects, threesixty_campaign)
        @subjects = subjects
        @threesixty_campaign = threesixty_campaign
        @requirement = @threesixty_campaign.nomination_requirements.first
      end

      def call
        count = @subjects.to_a.count do |subject|
          @requirement.conditions.all? do |condition|
            resolve_condition(subject, condition)
          end
        end
        broadcast :ok, count 
      end

      def resolve_condition(subject, condition)
        evaluators_count = subject.participants.joins(:relationship).where(relationships: {id: condition['relationship_id']}).uniq.count
        send(condition['comparator'], condition['value'], evaluators_count)
      end

      def atleast(value, evaluators_count)
        evaluators_count >= value
      end

      def exactly(value, evaluators_count)
        evaluators_count == value
      end

      def atmost(value, relationship_id)
        evaluators_count <= value
      end
    end
  end
end
