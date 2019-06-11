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
        data_sheet = get_data_sheet(@user)
        subject_data_sheet = get_data_sheet(@subject)

        result = criteria.all? do |condition|
          value = data_sheet[condition['field']].to_s
          subject_value = subject_data_sheet[condition['field']].to_s

          next value == condition['value'] if condition['operator'] == 'equal'
          next value == subject_value if condition['operator'] == 'is_same_as_subject'
        end
        broadcast :ok, result
      end

      private

      attr_reader :campaign, :criteria

      def get_data_sheet(user)
        row = DatasheetRow.
              joins(:datasheet).
              find_by(datasheets: { project_id: campaign.project.id }, email: user.email)
        row&.data || {}
      end

    end
  end
end
