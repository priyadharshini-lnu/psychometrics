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
      @hogan_assessment_id = user_assessment.assessment.external_settings[:assessment_id]
      @hogan_participant_id = credentials.participant_id
      @credentials = credentials
    end

    def call
      hogan_reports = user_result.external_user_reports(:hogan).to_a
      return broadcast(:no_hogan_report) if hogan_reports.empty?

      not_external_added_reports = hogan_reports.reject(&:external_added?)
      if not_external_added_reports.present?
        add_report_to_hogan(not_external_added_reports)
        if UserReport.exists?(id: not_external_added_reports.pluck(:id), external_added: false)
          return broadcast(:failed_to_add_report_in_hogan)
        end
      end

      HoganLog.create!(
        log_type: 'BeforeGetParticipantScore',
        participant_id: hogan_participant_id,
        group: hogan_group_name,
        call_stack: caller,
        meta: {
          hogan_report_ids: hogan_reports.pluck(:id),
          not_external_added_report_ids: not_external_added_reports.pluck(:id)
        }
      )
      participant_score = get_participant_score

      return broadcast(:not_completed) if participant_score.blank?

      user_result.update(external_results: participant_score)
      generate_internal_reports

      hogan_reports.each do |user_report|
        participant_report = get_participant_report(user_report)

        return broadcast(:not_completed) if participant_report.blank?

        user_report.update!(status: :generating)
        user_report.update!(pdf: "data:application/pdf;base64,#{participant_report}", status: :prepared)
      end

      broadcast(:ok)
    end

    private

    def add_report_to_hogan(hogan_reports)
      Hogan::AddReports.call!(
        group: hogan_group_name,
        credentials: credentials,
        assessment: user_result.assessment,
        reports: hogan_reports,
        user_id: user_result.evaluator_id
      )
    end

    def generate_internal_reports
      UsersResults::GenerateReports.call(
        user_result,
        user_result.user,
        exceptUserReportIds: user_result.external_user_reports(:hogan).pluck(:id)
      )
    end

    def get_participant_report(user_report)
      Services::Hogan::Api::Json::ParticipantReport.call!(
        group: hogan_group_name,
        assessment_id: hogan_assessment_id,
        report_id: user_report.report.external_settings[:report_id],
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

    def hogan_norm_id
      norm_from_report = user_result.external_user_reports(:hogan).first&.report&.external_settings&.dig(:norm_id)
      return norm_from_report if norm_from_report

      user_assessment.assessment.external_settings[:norm_id]
    end
  end
end
