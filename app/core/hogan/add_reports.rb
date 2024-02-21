# frozen_string_literal: true

module Hogan
  class AddReports < BaseCommand
    private_attr_reader :group, :credentials, :assessment, :add_participant_reports, :user_id, :reports

    def initialize(params)
      @group = params[:group]
      @credentials = params[:credentials]
      @assessment = params[:assessment]
      @user_id = params[:user_id]
      @reports = params[:reports]
    end

    def call
      create_group
      add_participant_to_group
      add_participant_assessment
      add_participant_reports
      broadcast(:ok)
    end

    private

    def create_group
      Services::Hogan::Api::Json::GroupDetails.call(group: group, provider: credentials&.provider) do
        on(:error) do
          Services::Hogan::Api::Json::CreateGroup.call!(group: group, provider: credentials&.provider)
        end
      end
    end

    def add_participant_to_group
      return if credentials.present?

      lock_key = "locks/hogan_credential/#{user_id}"
      lock_manager.lock!(lock_key, 2.minutes.in_milliseconds) do
        password = Devise.friendly_token.first(10)
        participant_id = Services::Hogan::Api::Json::AddParticipantToGroup.call!(
          group: group, password: password, provider: credentials&.provider
        )
        @credentials = HoganCredential.create!(
          password: password,
          participant_id: participant_id,
          user_id: user_id,
          provider: Settings.secrets.hogan[:default_provider]
        )
      end
    end

    def add_participant_assessment
      Services::Hogan::Api::Json::AddParticipantAssessment.call!(
        participant_id: credentials.participant_id,
        group: group,
        assessment_id: assessment.external_settings[:assessment_id],
        form_id: assessment.external_settings[:form_id],
        provider: credentials&.provider
      )
    end

    def add_participant_reports
      report_by_package_id_map = reports.filter { |r| r.report.hogan? }.
                                 group_by { |r| r.report_families_report&.external_package_id }

      report_by_package_id_map.each do |package_id, user_reports|
        if package_id.present?
          call_hogan_api(user_reports.first, package_id) do
            on(:ok) do
              UserReport.where(id: user_reports.pluck(:id)).update_all(external_added: true)
            end
          end
        else
          user_reports.each do |user_report|
            call_hogan_api(user_report) do
              on(:ok) do
                user_report.update!(external_added: true)
              end
            end
          end
        end
      end
    end

    def call_hogan_api(user_report, package_id = nil, &)
      report = user_report.report

      Services::Hogan::Api::Json::AddParticipantReport.call({
        group: group,
        norm_id: report.external_settings[:norm_id],
        language_id: report.external_settings[:language_id],
        assessment_id: assessment_id_for_report(user_report.external_report_id, package_id),
        participant_id: credentials.participant_id,
        provider: credentials&.provider,
        report_id: package_id || user_report.external_report_id,
        suitability_id: report.external_settings[:suitability_id]&.to_s
      }, &)
    end

    def assessment_id_for_report(report_id, package_id)
      if package_id.present?
        Settings.providers.hogan.report_packages.find { |p| p['id'] == package_id }&.default_assessment_id
      else
        Settings.providers.hogan.reports.find { |r| r['id'] == report_id }&.assessment_ids&.first
      end
    end

    def lock_manager
      @lock_manager ||= Redlock::Client.new([$redis])
    end
  end
end
