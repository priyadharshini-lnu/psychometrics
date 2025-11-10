# frozen_string_literal: true

# rubocop:disable Layout/LineLength
# TODO: Since we are not using interviewer, we have this dedicated tool, it would be better to make it more generic to use all tool type assistant for future proofing
module AI
  module Tools
    module Idp
      class AttachmentAnalysis < AI::Tools::Base
        class IdpDocumentNotFoundError < StandardError; end

        description 'Get detailed analysis for the document uploaded by user for their Individual Development Plan(IDP) creation purpose.'
        param :context,
              desc: 'Context on the document by the user, can include language to be used for writing analysis. e.g. "Generate analysis of the skill gap report by user in arabic"'

        private_attr_reader :user_idp_plan, :current_user, :ai_assistant

        def initialize(user_idp_plan, current_user, ai_assistant)
          @user_idp_plan = user_idp_plan
          @current_user = current_user
          @ai_assistant = ai_assistant
        end

        def execute(context: nil)
          validate_user_idp_document_exists!

          # Check if summary already exists
          if existing_summary_session&.completed?
            return existing_summary_session.summary
          end

          result = nil
          attachment_analysis_service = AI::AssistableService::Attachment.new(
            user_idp_document_attachment,
            current_user,
            document_analysis_assistant,
            context
          )

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

        def document_analysis_assistant
          @document_analysis_assistant ||= ai_assistant
        end

        def user_idp_document
          @user_idp_document ||= user_idp_plan.user_document
        end

        def user_idp_document_attachment
          @user_idp_document_attachment ||= user_idp_document.attachment
        end

        def validate_user_idp_document_exists!
          raise IdpDocumentNotFoundError, 'No document attached to the IDP plan' unless user_idp_plan.user_document.attached?
        end

        def existing_summary_session
          @existing_summary_session ||= user_idp_document_attachment&.ai_assisted_user_document_summary
        end
      end
    end
  end
end
# rubocop:enable Layout/LineLength
