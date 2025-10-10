# frozen_string_literal: true

module AI
  module AssistableService
    class Attachment < Base
      private_attr_reader :assistant, :attachment

      def initialize(attachment, current_user, assistant, instruction, options = {})
        @assistant = assistant
        @attachment = attachment
        super(attachment, current_user, instruction, options.merge(chat_params: chat_params))
      end

      def call
        mark_session_in_progress!

        assistant_service.
          on(:ok) do |assistant_response|
            handle_assistant_service_success(assistant_response)
          end.
          on(:error) do |error_message, error|
            handle_assistant_service_error(error_message, error)
          end.
          call
      end

      private

      def handle_assistant_service_error(error_message, error = nil)
        error_response, error_meta = handle_assistant_error_response(error_message, error)
        mark_session_failed!(error_response, meta: error_meta)
        broadcast(:error, error_response)
      end

      def handle_assistant_service_success(assistant_response)
        analysis = assistant_response[:message]
        mark_session_completed!(analysis)

        broadcast(:ok, analysis)
      end

      def assistant_context
        ''
      end

      def assistant_tools
        []
      end

      def session_model
        AI::AssistedUserDocumentSummary
      end

      def chat_params
        { with: attachment.blob.url, service: :openai_response_api }
      end
    end
  end
end
