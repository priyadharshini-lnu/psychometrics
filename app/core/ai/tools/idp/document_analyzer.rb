# frozen_string_literal: true

# rubocop:disable Layout/LineLength
# TODO: Since we are not using interviewer, we have this dedicated tool, it would be better to make it more generic to use all tool type assistant for future proofing
module AI
  module Tools
    module Idp
      class DocumentAnalyzer < AI::Tools::Base
        class IdpDocumentNotFoundError < StandardError; end

        description 'Get detailed analysis for the document uploaded by user for their Individual Development Plan(IDP) creation purpose.'
        param :context,
              desc: 'Context regarding the document to be passed to the expert assistant for analysis which would be passed with the uploaded document e.g. Document is resume by user. If no context is provided, the expert will use the default content as context and this can be nil'

        private_attr_reader :user_idp_plan, :current_user, :ai_assistant

        def initialize(user_idp_plan, current_user, ai_assistant)
          @user_idp_plan = user_idp_plan
          @current_user = current_user
          @ai_assistant = ai_assistant
        end

        # TODO: Seperate the layers of calling mechanism for clear segreation and handling of different parts
        def execute(context:)
          validate_user_idp_document_exists!

          return ai_assisted_doc_summary_session.summary if document_summary_exists?

          assistant_service = AI::AssistantService.new(
            document_analysis_assistant.id,
            current_user,
            context || document_analysis_assistant.user_prompt,
            chat: chat_with_session_context,
            chat_params: chat_params
          )

          ai_assisted_doc_summary_session.mark_as_in_progress!

          assistant_service.
            on(:ok) do |assistant_response|
              ai_assisted_doc_summary_session.mark_as_completed!(assistant_response[:message])

              return assistant_response[:message]
            end.
            on(:error) do |error_message|
              ai_assisted_doc_summary_session.mark_as_failed!(error_message)

              return { error: error_message }
            end.
            call
        rescue IdpDocumentNotFoundError => e
          { error: e.message }
        end

        private

        def chat_params
          { with: user_idp_document_blob.url, service: :openai_response_api }
        end

        def chat_with_session_context
          ai_assisted_doc_summary_session_chat.
            with_assistant_context
        end

        def ai_assisted_doc_summary_session_chat
          ai_assisted_doc_summary_session.ai_assistant_chat
        end

        def ai_assisted_doc_summary_session
          user_idp_document_blob.ai_assisted_user_document_summary || create_ai_assisted_doc_summary_session
        end

        def create_ai_assisted_doc_summary_session
          chat = create_new_chat_for_document_analysis
          user_idp_document_blob.create_ai_assisted_user_document_summary!(
            ai_assistant_chat: chat,
            user: current_user
          )
        end

        def create_new_chat_for_document_analysis
          document_analysis_assistant.for_user(current_user)
        end

        def document_analysis_assistant
          @document_analysis_assistant ||= ai_assistant
        end

        def user_idp_document_blob
          @user_idp_document_blob ||= user_idp_plan.user_document.blob
        end

        def validate_user_idp_document_exists!
          raise IdpDocumentNotFoundError, 'No document attached to the IDP plan' unless user_idp_plan.user_document.attached?
        end

        def document_summary_exists?
          ai_assisted_doc_summary_session.summary.present?
        end
      end
    end
  end
end
# rubocop:enable Layout/LineLength
