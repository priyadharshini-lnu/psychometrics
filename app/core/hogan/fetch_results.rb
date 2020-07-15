# frozen_string_literal: true

module Hogan
  class FetchResults < BaseCommand
    private_attr_reader :user_result, :report, :hogan_group_name, :hogan_assessment_id, :hogan_report_id,
                        :hogan_norm_id, :hogan_participant_id, :users_campaigns_assessment

    def initialize(users_campaigns_assessment, report, credentials, project)
      @users_campaigns_assessment = users_campaigns_assessment
      @user_result = users_campaigns_assessment.users_result
      @report = report

      # Hogan settings
      @hogan_group_name = project.hogan_group_name
      @hogan_assessment_id = users_campaigns_assessment.assessment.hogan_assessment_setting.hogan_assessment_id
      @hogan_report_id = report.hogan_report_setting.hogan_report_id
      @hogan_norm_id = report.hogan_report_setting.hogan_norm_id
      @hogan_participant_id = credentials.participant_id
    end

    def call
      participant_report = get_participant_report

      return broadcast(:not_completed) if participant_report.report.blank?

      CampaignsUsersReport.
        find_by(
          campaign_id: users_campaigns_assessment.campaign_id,
          report_id: report.id,
          user_id: user_result.evaluator_id
        ).
        update!(pdf: "data:application/pdf;base64,#{participant_report.report}", status: :prepared)
      participant_score = get_participant_score
      user_result.update(external_results: participant_score.response) if participant_score.response.present?

      broadcast(:ok)
    end

    private

    def get_participant_report
      Services::Hogan::API::ParticipantReport.call(
        group: hogan_group_name,
        assessment_id: hogan_assessment_id,
        report_id: hogan_report_id,
        participant_id: hogan_participant_id
      )
    end

    def get_participant_score
      Services::Hogan::API::ParticipantScore.call(
        group: hogan_group_name,
        participant_id: hogan_participant_id,
        assessment_id: hogan_assessment_id,
        norm_id: hogan_norm_id
      )
    end
  end
end
