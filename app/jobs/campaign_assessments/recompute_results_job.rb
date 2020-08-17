# frozen_string_literal: true

module CampaignAssessments
  class RecomputeResultsJob < ApplicationJob
    private_attr_reader :campaign_assessment, :current_user

    def perform(campaign_assessment, current_user)
      @campaign_assessment = campaign_assessment
      @current_user = current_user
      norm_data = {
        'id' => campaign_assessment.norm_id,
        'type' => campaign_assessment.norm_type
      }

      results.find_each do |res|
        ::UsersResults::Recompute.call!(res, norm_data)
        res.norm_id = campaign_assessment.norm_id
        res.norm_type = campaign_assessment.norm_type
        res.save!
      end

      users_reports.find_each do |user_report|
        UserReports::GeneratePdfJob.perform_now(user_report, current_user)
      end
    end

    def results
      UsersResult.joins(:user_assessments).
        where(
          assessment_id: campaign_assessment.assessment_id,
          user_assessments: { campaign_id: campaign_assessment.campaign_id },
          status: :completed
        ).
        includes(:evaluator)
    end

    def users_reports
      UserReport.where(
        report_id: report_ids,
        campaign_id: campaign_assessment.campaign_id,
        status: %i[generating prepared]
      )
    end

    def report_ids
      @report_ids ||= campaign_assessment.assessment.report_ids
    end
  end
end
