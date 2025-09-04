# frozen_string_literal: true

require_relative 'base'

module AI
  module OutputSchemas
    class IdpAssistant < Base
      # Schema context that can be added to system prompts
      SCHEMA_AS_CONTEXT = <<~SCHEMA_CONTEXT
        The assistant is aware that it must generate only one message at a time for it to be shown to user.
        Assistant must follow a strict JSON schema for all responses to ensure proper UI rendering. The response must include:

        **Required JSON Fields:**
        - `message`: Single message string (plain text only)
        - `suggestions`: Array of response options (can be empty)
        - `component`: One of: AssistantMessage, UserDocument, Summary, CompletionRequest, RetakeSteps
        - `data`: Object (required for Summary component only)

        **Summary Component Data:**
        - `document_summary`: EXACT tool response from ai--tools--user_idp_doc_analyzer (empty string if not called)
        - `chat_summary`: Generated chat analysis (markdown allowed)

        **MANDATORY Rules:**
        - Generate ONE JSON response only - no duplicates, no multiple objects
        - ONE message should be generated per response to ensure the message can be displayed
        - Use EXACT tool output for document_summary - never generate it
        - Only Summary fields support markdown

        WARNING: Generating multiple JSON objects or duplicates will cause system errors.
      SCHEMA_CONTEXT

      def self.as_context
        SCHEMA_AS_CONTEXT
      end

      string :message, description: 'Message by the assistant to be shown to the user'

      array :suggestions, of: :string,
        description: "Possible suggestion for the user as response to assistant's message, can also be empty"

      string :component, enum: %w[AssistantMessage UserDocument Summary CompletionRequest RetakeSteps],
        description: 'Type of component to be used to display assistant message to user'

      object :data, description: 'Additional data to be sent when using Summary component' do
        string :document_summary, description: 'Analysis of the document as it is'
        string :chat_summary, description: 'Summary of the chat'
      end
    end
  end
end
