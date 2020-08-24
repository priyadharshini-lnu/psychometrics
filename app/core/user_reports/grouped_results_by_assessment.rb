# frozen_string_literal: true

module UserReports
  class GroupedResultsByAssessment < BaseCommand
    private_attr_reader :user_report, :campaign

    def initialize(user_report)
      @user_report = user_report
      @campaign = user_report.campaign
    end

    def call
      serialized_result = user_report.user_results.completed.map do |user_result|
        ::UsersResultSerializer.new(user_result, campaign: campaign).to_h
      end.group_by { |result| result[:assessment_id] }

      broadcast :ok, serialized_result
    end
  end
end
