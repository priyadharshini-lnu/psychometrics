# frozen_string_literal: true

module AI
  module WritingAssistance
    class ResultGenerator < BaseCommand
      OPERATIONS = {
        'fix_grammar' => 'Fix grammar and spelling in the following text while preserving its original meaning and tone.', # rubocop:disable Layout/LineLength
        'concise' => 'Make the following text more concise and clear while retaining all key information.',
        'formal' => 'Rewrite the following text in a professional, formal tone suitable for business or academic communication.', # rubocop:disable Layout/LineLength
        'translate' => 'Translate the following text into %<language>s while preserving tone and nuance.'
      }.freeze

      MAX_RETRIES = 2

      private_attr_reader :user, :text, :operation, :context, :options, :retry_count

      def initialize(user:, text:, operation:, context: nil, options: {})
        @user = user
        @text = text
        @operation = operation
        @context = context
        @options = options
        @retry_count = 0
      end

      def call
        validate_operation!
        generate_result!
      rescue StandardError => e
        broadcast(:error, e.message)
      end

      private

      def validate_operation!
        return if OPERATIONS.key?(operation)

        raise ArgumentError, I18n.t('admin.assistant_toolbar_not_a_valid_operation', operation: operation)
      end

      def generate_result!
        assistant_service = AI::AssistantService.new(
          assistant.id,
          user,
          prompt,
          chat: chat
        )

        assistant_service.
          on(:ok) { |response| handle_response(response) }.
          on(:error) { |error_message| broadcast(:error, error_message) }.
          call
      end

      def handle_response(response)
        result = response[:message]
        if valid_response?(result)
          broadcast(:ok, result)
        else
          retry_or_fail
        end
      end

      def valid_response?(result)
        result.is_a?(Hash) && result.key?('result')
      end

      def retry_or_fail
        @retry_count += 1

        if @retry_count <= MAX_RETRIES
          generate_result!
        else
          broadcast(:error, I18n.t('admin.assistant_toolbar_failed'))
        end
      end

      def prompt
        instruction = build_instruction

        parts = ['<text_processing_instruction>', instruction]
        if context.present?
          parts << <<~CONTEXT
            <context>
            #{context}
            </context>
          CONTEXT
        end
        parts << '</text_processing_instruction>'
        parts << ''
        parts << '<text_to_process>'
        parts << text
        parts << '</text_to_process>'

        parts.join("\n")
      end

      def build_instruction
        base_instruction = OPERATIONS[operation]

        if operation == 'translate'
          language = options[:language] || 'English'
          base_instruction % { language: language }
        else
          base_instruction
        end
      end

      def assistant
        @assistant ||= AI::Assistant.writing_assistant.last ||
                       raise(StandardError, I18n.t('admin.writing_assistant_not_configured'))
      end

      def chat
        @chat ||= assistant.for_user(user)
      end
    end
  end
end
