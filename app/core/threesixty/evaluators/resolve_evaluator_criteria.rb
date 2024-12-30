# frozen_string_literal: true

module Threesixty
  module Evaluators
    class ResolveEvaluatorCriteria < BaseCommand
      def initialize(campaign, user, criteria, subject)
        @campaign = campaign
        @user = user
        @criteria = criteria
        @subject = subject
      end

      def call
        broadcast :ok, resolve_criteria
      end

      def resolve_criteria
        data_sheet = campaign.datasheet_data(@user.email)
        subject_data_sheet = campaign.datasheet_data(@subject.email)

        return false unless data_sheet

        criteria.all? do |condition|
          value = data_sheet[condition['field']]
          condition_value = value.is_a?(Numeric) ? condition['value'].to_d : condition['value']
          next value == condition_value if condition['comparator'] == 'equal'
          next false unless subject_data_sheet

          subject_value = subject_data_sheet[condition['field']]
          next value == subject_value if condition['comparator'] == 'is_same_as_subject'
        end
      end

      private

      attr_reader :campaign, :criteria
    end
  end
end
