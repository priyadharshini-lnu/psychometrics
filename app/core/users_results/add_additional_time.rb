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
      user_result.update!(
        expiry_date: nil,
        last_activity_at: nil,
        additional_time: additional_time
      )
      user_assessment.update(status: :interrupted)
    end

    def remove_reports
      UserReport.where(report_id: user_result.assessment.report_ids, user_id: user_result.user.id).each do |ur|
        ur.update!(remove_pdf: true, status: :generating)
      end
    end
  end
end
