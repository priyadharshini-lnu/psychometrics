# frozen_string_literal: true

module AI
  module AssistableService
    class Base < BaseCommand
      include AI::Concerns::ErrorHandler

      private_attr_reader :assistable, :current_user, :instructions, :options, :start_new_chat

      def initialize(assistable, current_user, instructions = nil, options = {})
        @assistable = assistable
        @current_user = current_user
        @instructions = instructions
        @options = options
        @start_new_chat = options[:start_new_chat]
      end

      def call
        raise NotImplementedError, "#{self.class} must implement #call"
      end

      def session
        @session ||= begin
          session_record = session_model.find_or_initialize_by(
            assistable: assistable,
            user: current_user
          )

          if start_new_chat || session_record.new_record?
            chat = assistant.for_user(
              current_user,
              contextual_information: assistant_context,
              prompt_template_context: prompt_template_context
            )
            session_record.save!
            chat.update!(ai_assisted_user_session: session_record)
          end

          session_record
        end
      end

      private

      def assistant
        raise NotImplementedError, "#{self.class} must implement #assistant"
      end

      # Any other context to be added as part of system prompt
      def assistant_context
        raise NotImplementedError, "#{self.class} must implement #assistant_context"
      end

      def assistant_tools
        raise NotImplementedError, "#{self.class} must implement #assistant_tools"
      end

      def session_model
        raise NotImplementedError, "#{self.class} must implement #session_model"
      end

      # Context for parsing liquid template if being used in the prompt
      def prompt_template_context
        {}
      end

      def assistant_service
        @assistant_service ||= AssistantService.new(
          assistant.id,
          current_user,
          instructions,
          chat: chat_with_context,
          ignore_user_prompt: options[:ignore_user_prompt],
          ask_params: options[:ask_params],
          params: request_params,
          prompt_template_context: options[:prompt_template_context],
          validate_response_structure: options[:validate_response_structure]
        )
      end

      def request_params
        {}
      end

      def mark_session_in_progress!
        session.mark_as_in_progress!
      end

      def mark_session_completed!(checkpoint = nil)
        session.mark_as_completed!(checkpoint)
      end

      def mark_session_failed!(error_response, meta: nil)
        session.mark_as_failed!(error_response, meta: meta)
      end

      def chat_with_context
        assisted_session_chat.with_assistant_context(tools: assistant_tools, params: request_params)
      end

      def assisted_session_chat
        @assisted_session_chat ||= session.latest_chat
      end

      # Set the instruction to be sent to the assistant
      def add_instructions(new_instructions)
        @instructions = <<~INSTRUCTIONS
          #{instructions}
          #{new_instructions}
        INSTRUCTIONS
      end
    end
  end
end
