# frozen_string_literal: true

module Hogan
  class AddReports < BaseCommand
    private_attr_reader :user_reports, :reports

    def initialize(user_reports)
      @user_reports = Array.wrap(user_reports)
    end

    def call
      return broadcast(:ok) if user_reports.empty?

      add_participant_reports

      broadcast(:ok)
    end

    private

    def add_participant_reports
      report_by_package_id_map = user_reports.filter { |r| r.report.hogan? }.
                                 group_by { |r| r.report_families_report&.external_package_id }

      report_by_package_id_map.each do |package_id, urs|
        if package_id.present?
          call_hogan_api(urs.first, package_id) do
            on(:ok) do
              UserReport.where(id: user_reports.pluck(:id)).update_all(external_added: true)
            end
          end
        else
          urs.each do |ur|
            call_hogan_api(ur) do
              on(:ok) do
                ur.update!(external_added: true)
              end
            end
          end
        end
      end
    end

    def call_hogan_api(user_report, package_id = nil, &)
      report = user_report.report

      Services::Hogan::Api::Json::AddParticipantReport.call({
        group: hogan_group_name,
        norm_id: hogan_norm_id(report),
        language_id: report.external_settings[:language_id],
        assessment_id: assessment_id_for_report(user_report.external_report_id, package_id),
        participant_id: credentials.participant_id,
        provider: credentials&.provider,
        report_id: package_id || user_report.external_report_id,
        suitability_id: report.external_settings[:suitability_id]&.to_s
      }, &)
    end

    def hogan_norm_id(report)
      norm_from_report = report.external_settings&.dig(:norm_id)

      return norm_from_report if norm_from_report.present? && norm_from_report != HoganCredential::DEFAULT_NORM

      credentials.norm
    end

    def assessment_id_for_report(report_id, package_id)
      if package_id.present?
        Settings.providers.hogan.report_packages.find { |p| p['id'] == package_id }&.default_assessment_id
      else
        report_setting = Settings.providers.hogan.reports.find { |r| r['id'] == report_id }
        report_setting&.default_assessment_id || report_setting&.assessment_ids&.first
      end
    end

    def credentials
      @credentials ||= user_reports.first.user.hogan_credential
    end

    def hogan_group_name
      @hogan_group_name ||= credentials.hogan_group_name
    end
  end
end
