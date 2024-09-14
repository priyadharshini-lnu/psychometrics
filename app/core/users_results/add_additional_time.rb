# frozen_string_literal: true

module UsersResults
  class AddAdditionalTime < BaseCommand
    private_attr_reader :user_result, :user_assessment, :additional_time

    def initialize(user_result, additional_time)
      @user_result = user_result
      @user_assessment = user_result.user_assessment
      @additional_time = additional_time
    end

    def call
      transaction do
        remove_reports if user_assessment.completed?
        add_additional_time
      end

      broadcast :ok
    end

    private

    def add_additional_time
      user_assessment.update!(
        status: :interrupted, expiry_date: nil, additional_time: additional_time, last_activity_at: nil
      )
    end

    def remove_reports
      user_assessment.user_reports.each(&:remove_report_pdf!)
    end
  end
end
