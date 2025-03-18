# frozen_string_literal: true

module UserReports
  class GroupedResultsByAssessment < BaseCommand
    private_attr_reader :user_report, :campaign, :view_report_as, :current_user

    def initialize(user_report, view_report_as, current_user = nil)
      @user_report = user_report
      @campaign = user_report.campaign
      @view_report_as = view_report_as
      @current_user = current_user
    end

    def call
      if user_report.report.category_threesixty?
        return broadcast(:ok, Threesixty::Reports::ResultsForSubject.call!(user_report, current_user))
      end

      serialized_result = user_report.
                          user_results(view_report_as).
                          map do |user_result|
                            ::Reports::ResultSerializer.new(context: { campaign: campaign }).serialize(user_result)
                          end.group_by { |result| result['assessment_id'] }

      broadcast :ok, serialized_result
    end
  end
end
