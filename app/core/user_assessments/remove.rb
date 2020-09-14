# frozen_string_literal: true

module UserAssessments
  class Remove < BaseCommand
    private_attr_reader :user_assessment, :campaign

    def initialize(user_assessment, campaign)
      @user_assessment = user_assessment
      @campaign = campaign
    end

    def call
      remove_user_reports
      user_assessment.destroy!
    end

    def remove_user_reports
      report_ids = user_assessment.assessment.reports.ids
      UserReport.where(
        'report_id IN (?) and user_id = (?) and campaign_id = (?)',
        report_ids, user_assessment.subject_id, campaign.id
      ).each(&:destroy!)
    end
  end
end
