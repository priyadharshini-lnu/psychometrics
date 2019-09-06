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
        data_sheet = get_data_sheet(@user)&.data
        subject_data_sheet = get_data_sheet(@subject)&.data

        return false unless data_sheet

        result = criteria.all? do |condition|
          value = data_sheet[condition['field']].to_s.downcase
          next value == condition['value'] if condition['comparator'] == 'equal'
          next false unless subject_data_sheet
          subject_value = subject_data_sheet[condition['field']].to_s.downcase
          next value == subject_value if condition['comparator'] == 'is_same_as_subject'
        end

        result
      end

      private

      attr_reader :campaign, :criteria

      def get_data_sheet(user)
        campaign.datasheet&.rows&.find_by(email: user.email)
      end

    end
  end
end
