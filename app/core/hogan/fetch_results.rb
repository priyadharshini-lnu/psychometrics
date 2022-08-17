# frozen_string_literal: true

module Hogan
  class FetchResults < BaseCommand
    private_attr_reader :user_result, :hogan_group_name, :hogan_assessment_id,
                        :hogan_participant_id, :user_assessment, :credentials

    def initialize(user_result, credentials, project)
      @user_result = user_result
      @user_assessment = user_result.user_assessment

      # Hogan settings
      @hogan_group_name = project.hogan_group_name
      @hogan_assessment_id = user_assessment.assessment.hogan_assessment_setting.hogan_assessment_id
      @hogan_participant_id = credentials.participant_id
      @credentials = credentials
    end

    def call
      return broadcast(:no_hogan_report) unless has_hogan_report?

      participant_score = get_participant_score

      return broadcast(:not_completed) unless participant_score.present?

      user_result.update(external_results: participant_score)
      generate_internal_reports

      user_result.external_user_reports(:hogan).each do |user_report|
        participant_report = get_participant_report(user_report)

        return broadcast(:not_completed) if participant_report.blank?

        user_report.update!(status: :generating)
        user_report.update!(pdf: "data:application/pdf;base64,#{participant_report}", status: :prepared)
      end

      broadcast(:ok)
    end

    private

    def generate_internal_reports
      UsersResults::GenerateReports.call(
        user_result,
        user_result.user,
        exceptUserReportIds: user_result.external_user_reports(:hogan).pluck(:id)
      )
    end

    def get_participant_report(user_report)
      hogan_report_id = user_report.report.hogan_report_setting.hogan_report_id
      Services::Hogan::Api::Json::ParticipantReport.call!(
        group: hogan_group_name,
        assessment_id: hogan_assessment_id,
        report_id: hogan_report_id,
        participant_id: hogan_participant_id,
        provider: credentials.provider
      )
    end

    def get_participant_score
      Services::Hogan::Api::Json::ParticipantScore.call!(
        group: hogan_group_name,
        participant_id: hogan_participant_id,
        assessment_id: hogan_assessment_id,
        norm_id: hogan_norm_id,
        provider: credentials.provider
      )
    end

    def has_hogan_report?
      Services::Hogan::Api::Json::GetParticipantProfile.call!(
        group: hogan_group_name,
        participant_id: hogan_participant_id,
        provider: credentials.provider
      ).dig('reportDetails').present?
    end

    def hogan_norm_id
      norm_from_report = user_result.external_user_reports(:hogan).first&.report&.hogan_report_setting&.hogan_norm_id
      return norm_from_report if norm_from_report

      user_assessment.assessment.hogan_assessment_setting.norm_id
    end
  end
end
