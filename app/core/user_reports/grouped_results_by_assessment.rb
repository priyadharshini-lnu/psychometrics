# frozen_string_literal: true

module UserReports
  class GroupedResultsByAssessment < BaseCommand
    private_attr_reader :user_report, :campaign, :view_report_as

    def initialize(user_report, view_report_as)
      @user_report = user_report
      @campaign = user_report.campaign
      @view_report_as = view_report_as
    end

    def call
      serialized_result = user_report.
                          user_results(view_report_as).
                          map do |user_result|
                            ::Reports::ResultSerializer.new(context: { campaign: campaign }).serialize(user_result)
                          end.group_by { |result| result['assessment_id'] }

      broadcast :ok, serialized_result
    end
  end
end
