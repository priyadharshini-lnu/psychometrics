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

      private

      def assistant
        raise NotImplementedError, "#{self.class} must implement #assistant"
      end

      def assistant_context
        raise NotImplementedError, "#{self.class} must implement #assistant_context"
      end

      def assistant_tools
        raise NotImplementedError, "#{self.class} must implement #assistant_tools"
      end

      def session_model
        raise NotImplementedError, "#{self.class} must implement #session_model"
      end

      def assistant_service
        @assistant_service ||= AssistantService.new(
          assistant.id,
          current_user,
          instructions,
          chat: chat_with_context,
          ignore_user_prompt: options[:ignore_user_prompt],
          chat_params: options[:chat_params]
        )
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
        assisted_session_chat.with_assistant_context(tools: assistant_tools)
      end

      def assisted_session_chat
        @assisted_session_chat ||= session.ai_assistant_chat
      end

      def session
        @session ||= begin
          session_record = session_model.find_or_initialize_by(
            assistable: assistable,
            user: current_user
          )

          if start_new_chat || session_record.new_record?
            chat = assistant.for_user(current_user, contextual_information: assistant_context)
            session_record.ai_assistant_chat = chat
            session_record.save! if session_record.new_record?
          end

          session_record
        end
      end
    end
  end
end
