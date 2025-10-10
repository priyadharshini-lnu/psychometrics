# frozen_string_literal: true

# rubocop:disable Layout/LineLength
# TODO: Since we are not using interviewer, we have this dedicated tool, it would be better to make it more generic to use all tool type assistant for future proofing
module AI
  module Tools
    module Idp
      class SkillGapReportAnalysis < AI::Tools::Base
        class IdpDocumentNotFoundError < StandardError; end

        description 'Get detailed analysis for the user skill gap report for their Individual Development Plan(IDP) creation purpose.'

        private_attr_reader :user_idp_plan, :current_user, :ai_assistant

        def initialize(user_idp_plan, current_user, ai_assistant)
          @user_idp_plan = user_idp_plan
          @current_user = current_user
          @ai_assistant = ai_assistant
        end

        def execute
          validate_skill_gap_report_exists!

          result = nil
          attachment_analysis_service = AI::AssistableService::Attachment.new(
            skill_gap_report.pdf_file.attachment,
            current_user,
            gap_report_analysis_assistant,
            nil
          )

          if existing_summary_session&.completed?
            return existing_summary_session.summary
          end

          attachment_analysis_service.
            on(:ok) do |analysis|
              result = analysis
            end.
            on(:error) do |error_message|
              result = { error: error_message }
            end.
            call

          result
        rescue IdpDocumentNotFoundError => e
          { error: e.message }
        end

        private

        def gap_report_analysis_assistant
          @gap_report_analysis_assistant ||= ai_assistant
        end

        def skill_gap_report
          @skill_gap_report ||= user_idp_plan.user_skill_gap_report
        end

        def pdf_attached?
          skill_gap_report&.pdf_file&.attached?
        end

        def idp_template
          @idp_template ||= user_idp_plan.idp_template
        end

        def validate_skill_gap_report_exists!
          raise IdpDocumentNotFoundError, 'Skill gap report is not available' unless pdf_attached?
        end

        def existing_summary_session
          @existing_summary_session ||= skill_gap_report&.pdf_file&.ai_assisted_user_document_summary
        end
      end
    end
  end
end
# rubocop:enable Layout/LineLength
