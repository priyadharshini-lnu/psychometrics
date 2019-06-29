# frozen_string_literal: true

module Threesixty
  module NominationRequirements
    class FindForSubject < BaseCommand
      attr_reader :subject, :threesixty_campaign, :subject_conditions, :datasheet_row_data, :nomination_requirements

      # We use datasheet_row_map in order to avoid N+1 queries
      def initialize(subject, threesixty_campaign, datasheet_row_map = nil, nomination_requirements = nil)
        @subject = subject
        @threesixty_campaign = threesixty_campaign
        @nomination_requirements = nomination_requirements || fetch_nomination_requirements
        @datasheet_row_data = datasheet_row_map ? (datasheet_row_map[subject.user.email]&.data || {}) : fetch_datasheet_row_data
      end

      def call
        nomination_requirement = nomination_requirements.find do |n|
          Threesixty::NestedConditionResolver.call!(n.subject_conditions, proc { |condition| resolve_condition(condition) })
        end
        broadcast :ok, nomination_requirement
      end

      def resolve_condition(condition)
        field = condition['field']
        value = condition['value']&.downcase
        value_from_datasheet = datasheet_row_data[field].to_s.downcase
        result =
          if condition['comparator'] == 'equal'
            value_from_datasheet == value.downcase
          else
            value_from_datasheet != value.downcase
          end

        { operator: condition['operator'], result: result }
      end

      private

      def fetch_datasheet_row_data
        threesixty_campaign.datasheet&.
          rows&.
          find_by(email: subject.user.email)&.
          data || {}
      end

      def fetch_nomination_requirements
        threesixty_campaign.nomination_requirements.order(:position)
      end
    end
  end
end
