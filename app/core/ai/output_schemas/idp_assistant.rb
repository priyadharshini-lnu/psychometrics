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
        - `suggestions`: Array of possible responses by the user to the message of assistant (can be empty)
        - `component`: One of: AssistantMessage, RequestDocument, Summary, RetakeSteps, IdpCreated
        - `checkpoint`: Optional field for internal reasoning/state (not shown to user, can be null/empty unless specified on what to store here)
        - `data`: Object (required for Summary component only)

        **Summary Component Schema:**
        When selecting `Summary` component, the `data` object must include:
        - `document_summary`: EXACT tool response from document analysis tool (empty string if not called).
        - `skill_gap_report_analysis`: EXACT tool response from skill gap report analysis tool (empty string if not called).
        - `chat_summary`: Generated chat analysis (markdown allowed)
        - Summary component by default will ask user to proceed for plan creation
      SCHEMA_CONTEXT

      def self.as_context
        SCHEMA_AS_CONTEXT
      end

      string :message, description: 'Message by the assistant to be shown to the user'

      array :suggestions, of: :string,
        description: "Possible suggestion for the user as response to assistant's message, can also be empty"

      string :component, enum: %w[AssistantMessage RequestDocument Summary RetakeSteps IdpCreated],
        description: <<~DESC
          Type of component to be used to display assistant message to user
          AssistantMessage: Regular message from assistant
          RequestDocument: Request user to upload document, once uploaded it must be analyzed immediately
          Summary: Show summary of document analysis and chat. Component by DEFAULT also asks user if they want to proceed with plan creation or not.
          RetakeSteps: Should be used when user does not want to proceed with plan creation after summary generation.
          IdpCreated: Inform user that IDP has been created successfully. Should be used only AFTER the IDP is created as it redirects to user's plan page.
        DESC

      string :checkpoint,
             description: 'Optional field for internal assistant reasoning/state tracking. Not shown to user. ' \
                          'Should be empty unless specified to add.'

      object :data, description: 'Additional data to be sent when using Summary component' do
        string :document_summary, description: <<~DESC
          Complete unmodified analysis from document analysis tool. Do not interpret or condense the analysis - return verbatim.

          CORRECT: Return complete analysis as received.
          INCORRECT: "Based on the analysis, I can see.."
          INCORRECT: "The key insights from this document are..."
        DESC
        string :skill_gap_report_analysis, description: <<~DESC
          Complete unmodified analysis from skill gap report analysis tool. Do not interpret or condense the analysis - return verbatim.
        DESC
        string :chat_summary, description: 'Summary of the chat interaction with user (markdown allowed)'
        string :file_name,
               description: 'Name of the uploaded document file by the user, should be blank if no document uploaded'
      end
    end
  end
end
