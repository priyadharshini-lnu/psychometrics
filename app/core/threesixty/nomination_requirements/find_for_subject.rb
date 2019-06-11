# frozen_string_literal: true

module Threesixty
  module NominationRequirements
    class FindForSubject < BaseCommand
      attr_reader :subject, :threesixty_campaign, :subject_conditions

      def initialize(subject, threesixty_campaign)
        @subject = subject
        @threesixty_campaign = threesixty_campaign
      end

      def call
        return broadcast :ok, nil if datasheet_row_data.nil?
        nomination_requirement = nomination_requirements.find do |n|
          Threesixty::NestedConditionResolver.call!(n.subject_conditions, proc { |condition| resolve_condition(condition) })
        end
        broadcast :ok, nomination_requirement
      end

      def resolve_condition(condition)
        field = condition['field']
        value = condition['value']
        value_from_datasheet = datasheet_row_data[field].to_s.downcase
        result = if condition['comparator'] == 'equal'
          value_from_datasheet == value.downcase
        else
          value_from_datasheet != value.downcase
        end

        {operator: condition['operator'], result: result}
      end

      private

      def datasheet_row_data
        @_datasheet_row_data ||= threesixty_campaign.datasheet&.
          rows&.
          find_by(email: subject.user.email)
          &.data
      end

      def nomination_requirements
        threesixty_campaign.nomination_requirements.order(:position)
      end
    end
  end
end
