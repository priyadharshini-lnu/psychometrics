# frozen_string_literal: true

module AI
  module WritingAssistance
    class ResultGenerator < BaseCommand
      OPERATION_ORDER = {
        'fix_grammar' => 1,
        'concise' => 2,
        'tone' => 3,
        'translate' => 4
      }.freeze

      OPERATIONS = {
        'fix_grammar' => 'Fix grammar and spelling while preserving original meaning and tone.',
        'concise' => 'Make the text more concise and clear while retaining all key information.',
        'tone' => 'Rewrite in a %<tone>s tone.',
        'translate' => 'Translate into %<language>s while preserving tone and nuance.'
      }.freeze

      MAX_RETRIES = 2

      private_attr_reader :user, :text, :operations, :retry_count, :user_language

      def initialize(user:, text:, operations:, user_locale: nil)
        @user = user
        @text = text
        @operations = Array(operations)
        @retry_count = 0
        locale = user_locale.presence || user&.user_profile&.locale
        @user_language = I18n.t("languages.#{locale}", default: 'English')
      end

      def call
        validate_operations!
        generate_result!
      rescue StandardError => e
        broadcast(:error, e.message)
      end

      private

      def validate_operations!
        invalid_ops = operations.map { |op| op[:type] }.reject { |type| OPERATIONS.key?(type) }
        return if invalid_ops.empty?

        raise ArgumentError, I18n.t(
          'admin.assistant_toolbar_not_a_valid_operation',
          operation: invalid_ops.join(', ')
        )
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
        <<~PROMPT
          <text_processing_instructions>
          #{operation_instructions}
          Apply these operations in the specified order. Each operation processes the result of the previous one.
          </text_processing_instructions>

          <text_to_process>
          #{text}
          </text_to_process>
        PROMPT
      end

      def operation_instructions
        operations.
          sort_by { |op| OPERATION_ORDER.fetch(op[:type], Float::INFINITY) }.
          map.with_index(1) do |operation, index|
            <<~OPERATION.strip
              <operation order="#{index}">
              Type: #{operation[:type]}
              Instruction: #{build_instruction(operation)}
              </operation>
            OPERATION
          end.
          join("\n\n")
      end

      def build_instruction(operation)
        base = OPERATIONS[operation[:type]]
        options = operation[:options] || {}

        case operation[:type]
          when 'translate'
            language = options[:language] || 'English'
            base % { language: language }
          when 'tone'
            tone = options[:tone] || 'formal'
            base % { tone: tone }
          when 'concise'
            word_count = options[:target_word_count]
            word_count ? "#{base} Target approximately #{word_count} words." : base
          else
            base
        end
      end

      def assistant
        @assistant ||= AI::Assistant.writing_assistant.last ||
                       raise(StandardError, I18n.t('admin.writing_assistant_not_configured'))
      end

      def chat
        @chat ||= assistant.for_user(
          user,
          contextual_information: %(The "what_changed_and_why" field must be written in #{@user_language}.)
        )
      end
    end
  end
end
