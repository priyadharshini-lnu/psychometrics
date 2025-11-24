# frozen_string_literal: true

module Lti
  module Ags
    class SaveScoresAndReport < BaseCommand
      private_attr_reader :user_assessment, :score_data

      def initialize(user_assessment, score_data = nil)
        @user_assessment = user_assessment
        @score_data = score_data
      end

      def call
        user_assessment.users_result.update(external_results: score_data)

        generate_internal_reports

        broadcast :ok
      end

      private

      def generate_internal_reports
        ::UsersResults::GenerateReports.call(user_assessment.users_result, user_assessment.user)
      end
    end
  end
end
