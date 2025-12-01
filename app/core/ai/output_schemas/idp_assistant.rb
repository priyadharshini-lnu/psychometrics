# frozen_string_literal: true

require_relative 'base'

module AI
  module OutputSchemas
    class IdpAssistant < Base
      # Schema context that can be added to system prompts
      SCHEMA_CONTEXT = <<~SCHEMA_CONTEXT
        The assistant is aware that it must generate only one message at a time for it to be shown to user.
        Assistant must follow a strict JSON schema for all responses to ensure proper UI rendering.
      SCHEMA_CONTEXT

      def self.context
        SCHEMA_CONTEXT
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
