# frozen_string_literal: true

module AI
  module AssistableService
    class Attachment < Base
      class InformationExtractionError < StandardError; end
      private_attr_reader :assistant, :attachment

      def initialize(attachment, current_user, assistant, instruction, options = {})
        @assistant = assistant
        @attachment = attachment
        super(attachment, current_user, instruction, options.merge(ask_params: ask_params))
      end

      def call
        mark_session_in_progress!

        add_instructions(file_as_context) if assistant_has_text_only_model?

        assistant_service.
          on(:ok) do |assistant_response|
            handle_assistant_service_success(assistant_response)
          end.
          on(:error) do |error_message, error|
            handle_assistant_service_error(error_message, error)
          end.
          call
      rescue InformationExtractionError => e
        handle_assistant_service_error(e.message, e)
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
        # Using session context for ensure generation is in right langauge
        <<~CONTEXT
          <session_context>
            #{user_dependency.parse}
          <session_context>
        CONTEXT
      end

      def user_dependency
        AI::Utils::DependencyParser::UserData.new(
          current_user,
          # This is handling the case when the assistant is used to bulk create IDPs for users in a specific language
          # By default User.locale is used if no locale is passed
          locale: options[:locale]
        )
      end

      def assistant_tools
        []
      end

      def session_model
        AI::AssistedUserDocumentSummary
      end

      # This is param used with .ask method of the chat to use response_api with openai models
      def ask_params
        return {} if assistant_has_text_only_model?

        { with: attachment.blob.url, service: :openai_response_api }
      end

      def file_as_context
        # citation context is to deal with cohere models that support citations
        <<~FILE
          <document filename="#{attachment.filename}" citation_required="false">
          #{extracted_information_as_context}
          </document>
        FILE
      end

      def extracted_information_as_context
        # If session_meta_info has extracted document text use it otherwise perform OCR
        return session_meta_info[:document] || session_meta_info['document'] if session_has_extracted_text?

        ocr_service = AI::Services::OciOcr.new(attachment.blob)

        ocr_service.on(:ok) do |extracted_text|
          # Update session meta with extracted text for future use
          # We don't use the checkpoint here as to ensure that we have the extracted text saved
          # apart from generated analysis/summary in checkpoint
          session.update!(meta: { document: extracted_text })
          return extracted_text
        end.
          on(:error) do |error_message|
          raise InformationExtractionError, error_message
        end.
          call
      end

      def session_has_extracted_text?
        session_meta_info.is_a?(Hash) &&
          (session_meta_info[:document].present? || session_meta_info['document'].present?)
      end

      def session_meta_info
        @session_meta_info ||= session.meta
      end

      def assistant_has_text_only_model?
        assistant.ai_provider_for_model['custom_provider'].present? &&
          assistant.ai_provider_for_model.dig('modalities', 'input') == ['text']
      end
    end
  end
end
