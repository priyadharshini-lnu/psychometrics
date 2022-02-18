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
      Services::Hogan::API::JSON::GroupDetails.call(group: group, provider: credentials&.provider) do
        on(:error) do
          Services::Hogan::API::JSON::CreateGroup.call!(group: group, provider: credentials&.provider)
        end
      end
    end

    def add_participant_to_group
      return if credentials.present?

      lock_key = "locks/hogan_credential/#{user_id}"
      lock_manager.lock!(lock_key, 2.minutes.in_milliseconds) do
        password = Devise.friendly_token.first(10)
        participant_id = Services::Hogan::API::JSON::AddParticipantToGroup.call!(
          group: group, password: password, provider: credentials&.provider
        )
        @credentials = HoganCredential.create!(
          password: password,
          participant_id: participant_id,
          user_id: user_id,
          provider: Rails.application.secrets.hogan[:default_provider]
        )
      end
    end

    def add_participant_assessment
      Services::Hogan::API::JSON::AddParticipantAssessment.call!(
        participant_id: credentials.participant_id,
        group: group,
        assessment_id: assessment.hogan_assessment_setting.hogan_assessment_id,
        form_id: assessment.hogan_assessment_setting.hogan_form_id,
        provider: credentials&.provider
      )
    end

    def add_participant_reports
      reports.each do |user_report|
        report = user_report.report
        next unless report.hogan?

        Services::Hogan::API::JSON::AddParticipantReport.call!(
          group: group,
          norm_id: report.hogan_report_setting.hogan_norm_id,
          language_id: report.hogan_report_setting.hogan_language_id,
          assessment_id: assessment.hogan_assessment_setting.hogan_assessment_id,
          report_id: report.hogan_report_setting.hogan_report_id,
          participant_id: credentials.participant_id,
          provider: credentials&.provider
        )
      end
    end

    def lock_manager
      @lock_manager ||= Redlock::Client.new([Redis.current])
    end
  end
end
