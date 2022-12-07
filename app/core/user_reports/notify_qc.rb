# frozen_string_literal: true

module UserReports
  class NotifyQc < BaseCommand
    def initialize(user_report)
      @user_report = user_report
    end

    def call
      emails = [] # Remove Approval: Status changes to 'Changes Requested'. Send email to QCs
      ::ReportApproving::QcNotificationMailer.notify(@user_report, emails).deliver_later
    end
  end
end
