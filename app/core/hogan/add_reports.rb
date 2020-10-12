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
      result = Services::Hogan::API::GroupDetails.call(group: group)
      return if result.success?

      Services::Hogan::API::CreateGroup.call!(group: group)
    end

    def add_participant_to_group
      return if credentials.present?

      password = Devise.friendly_token.first(10)
      result = Services::Hogan::API::AddParticipantToGroup.call!(group: group, password: password)
      @credentials = HoganCredential.create!(
        password: password,
        participant_id: result.participant_id,
        user_id: user_id
      )
    end

    def add_participant_assessment
      Services::Hogan::API::AddParticipantAssessment.call!(
        participant_id: credentials.participant_id,
        group: group,
        assessment_id: assessment.hogan_assessment_setting.hogan_assessment_id,
        form_id: assessment.hogan_assessment_setting.hogan_form_id
      )
    end

    def add_participant_reports
      reports.each do |user_report|
        report = user_report.report
        next unless report.hogan?

        Services::Hogan::API::AddParticipantReport.call!(
          group: group,
          norm_id: report.hogan_report_setting.hogan_norm_id,
          language_id: report.hogan_report_setting.hogan_language_id,
          assessment_id: assessment.hogan_assessment_setting.hogan_assessment_id,
          report_id: report.hogan_report_setting.hogan_report_id,
          participant_id: credentials.participant_id
        )
      end
    end
  end
end
