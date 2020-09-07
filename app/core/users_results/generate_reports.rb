# frozen_string_literal: true

module UsersResults
  class GenerateReports < BaseCommand
    private_attr_reader :user_result, :campaign, :current_user

    def initialize(user_result, current_user)
      @user_result = user_result
      @current_user = current_user
    end

    def call
      user_result.user_reports.each do |user_report|
        UserReports::GenerateAndSavePdfJob.perform_later(user_report, current_user)
      end

      broadcast :ok
    end
  end
end
