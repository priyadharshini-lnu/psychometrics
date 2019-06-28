module Services
  module Hogan
    class AssignAssessmentAndReports
      include Interactor

      def call
        context.group = context.assessment_params[:group]
        context.membership = context.assessment_params[:membership]
        context.assessment = context.assessment_params[:assessment]
        context.reports = context.assessment_params[:reports]

        create_group
        add_participant_to_group
        add_participant_assessment
        add_participant_reports
      end

      private

      def create_group
        result = Services::Hogan::API::GroupDetails.call(group: context.group)
        return if result.success?

        Services::Hogan::API::CreateGroup.call!(group: context.group)
      end

      def add_participant_to_group
        return if context.membership.hogan_credential.present?

        password = Devise.friendly_token.first(10)
        result = Services::Hogan::API::AddParticipantToGroup.call!(group: context.group, password: password)
        context.membership.create_hogan_credential(password: password, participant_id: result.participant_id)
      end

      def add_participant_assessment
        Services::Hogan::API::AddParticipantAssessment.call!(
          participant_id: context.membership.hogan_credential.participant_id,
          group: context.group,
          assessment_id: context.assessment.hogan_assessment_setting.hogan_assessment_id,
          form_id: context.assessment.hogan_assessment_setting.hogan_form_id
        )
      end

      def add_participant_reports
        context.reports.each do |report|
          Services::Hogan::API::AddParticipantReport.call!(
            group: context.group,
            norm_id: report.hogan_report_setting.hogan_norm_id,
            language_id: report.hogan_report_setting.hogan_language_id,
            assessment_id: context.assessment.hogan_assessment_setting.hogan_assessment_id,
            report_id: report.hogan_report_setting.hogan_report_id,
            participant_id: context.membership.hogan_credential.participant_id
          ) if report.hogan?
        end
      end
    end
  end
end
