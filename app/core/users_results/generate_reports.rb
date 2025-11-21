# frozen_string_literal: true

module UsersResults
  class GenerateReports < BaseCommand
    private_attr_reader :user_result, :campaign, :current_user, :options

    def initialize(user_result, current_user, options = {})
      @user_result = user_result
      @current_user = current_user
      @options = options
    end

    def call
      user_result.user_reports.each do |user_report|
        next if options[:exceptUserReportIds]&.include?(user_report.id)

        unless user_report.has_approval_workflow?
          user_report.update_attribute(:approval_status, :approved)
          UserReports::GenerateAndSavePdfJob.perform_later(user_report, current_user)
        end
      end

      broadcast :ok
    end
  end
end
