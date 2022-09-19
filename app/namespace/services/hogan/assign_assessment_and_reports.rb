# frozen_string_literal: true

module Services
  module Hogan
    class AssignAssessmentAndReports
      include Interactor

      def call
        context.group = context.assessment_params[:group]
        context.membership = context.assessment_params[:membership]
        context.assessment = context.assessment_params[:assessment]
        context.reports = context.assessment_params[:reports]
        context.credentials = context.membership.hogan_credential

        create_group
        add_participant_to_group
        add_participant_assessment
        add_participant_reports
      end

      private

      def create_group
        Services::Hogan::Api::Json::GroupDetails.call(
          group: context.group, provider: context.credentials&.provider
        ) do
          on(:error) do
            Services::Hogan::Api::Json::CreateGroup.call!(group: context.group, provider: context.credentials&.provider)
          end
        end
      end

      def add_participant_to_group
        return if context.membership.hogan_credential.present?

        password = Devise.friendly_token.first(10)
        participant_id = Services::Hogan::Api::Json::AddParticipantToGroup.call!(
          group: context.group, password: password, provider: context.credentials&.provider
        )
        context.credentials = context.membership.create_hogan_credential(
          password: password, participant_id: participant_id
        )
      end

      def add_participant_assessment
        Services::Hogan::Api::Json::AddParticipantAssessment.call!(
          participant_id: context.membership.hogan_credential.participant_id,
          group: context.group,
          assessment_id: context.assessment.hogan_assessment_setting.hogan_assessment_id,
          form_id: context.assessment.hogan_assessment_setting.hogan_form_id,
          provider: context.credentials&.provider
        )
      end

      def add_participant_reports
        context.reports.each do |report|
          next unless report.hogan?

          Services::Hogan::Api::Json::AddParticipantReport.call!(
            group: context.group,
            norm_id: report.hogan_report_setting.hogan_norm_id,
            language_id: report.hogan_report_setting.hogan_language_id,
            assessment_id: context.assessment.hogan_assessment_setting.hogan_assessment_id,
            report_id: report.hogan_report_setting.hogan_report_id,
            participant_id: context.membership.hogan_credential.participant_id,
            provider: context.credentials&.provider
          )
        end
      end
    end
  end
end
