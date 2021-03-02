# frozen_string_literal: true

module Hogan
  class FetchResults < BaseCommand
    private_attr_reader :user_result, :report, :hogan_group_name, :hogan_assessment_id, :hogan_report_id,
                        :hogan_norm_id, :hogan_participant_id, :user_assessment, :credentials

    def initialize(user_assessment, report, credentials, project)
      @user_assessment = user_assessment
      @user_result = user_assessment.users_result
      @report = report

      # Hogan settings
      @hogan_group_name = project.hogan_group_name
      @hogan_assessment_id = user_assessment.assessment.hogan_assessment_setting.hogan_assessment_id
      @hogan_report_id = report.hogan_report_setting.hogan_report_id
      @hogan_norm_id = report.hogan_report_setting.hogan_norm_id
      @hogan_participant_id = credentials.participant_id
      @credentials = credentials
    end

    def call
      participant_report = get_participant_report

      return broadcast(:not_completed) if participant_report.blank?

      UserReport.
        find_by(
          campaign_id: user_assessment.campaign_id,
          report_id: report.id,
          user_id: user_result.evaluator_id
        ).
        update!(pdf: "data:application/pdf;base64,#{participant_report}", status: :prepared)
      participant_score = get_participant_score
      user_result.update(external_results: participant_score) if participant_score.present?

      broadcast(:ok)
    end

    private

    def get_participant_report
      Services::Hogan::API::JSON::ParticipantReport.call!(
        group: hogan_group_name,
        assessment_id: hogan_assessment_id,
        report_id: hogan_report_id,
        participant_id: hogan_participant_id,
        provider: credentials.provider
      )
    end

    def get_participant_score
      Services::Hogan::API::JSON::ParticipantScore.call!(
        group: hogan_group_name,
        participant_id: hogan_participant_id,
        assessment_id: hogan_assessment_id,
        norm_id: hogan_norm_id,
        provider: credentials.provider
      )
    end
  end
end
