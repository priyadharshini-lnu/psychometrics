# frozen_string_literal: true

module AI
  class TranslationAssistance < BaseCommand
    MAX_RETRIES = 3

    private_attr_reader :user, :texts, :options

    def initialize(user:, texts:, options: {})
      @user = user
      @texts = texts
      @options = options
    end

    def call
      translate!
    rescue StandardError => e
      broadcast(:error, e.message)
    end

    private

    def translate!
      assistant_service = AI::AssistantService.new(
        assistant.id,
        user,
        prompt,
        chat: chat,
        validate_response_structure: true
      )

      assistant_service.
        on(:ok) { |response| handle_response(response) }.
        on(:error) { |error_message| broadcast(:error, error_message) }.
        call
    end

    def handle_response(response)
      result = response[:message]
      broadcast(:ok, result)
    end

    def prompt
      instruction = build_instruction

      parts = ['<text_processing_instruction>', instruction, '</text_processing_instruction>']
      parts << ''
      parts << '<text_to_process>'
      parts << texts
      parts << '</text_to_process>'
      parts.join("\n")
    end

    def build_instruction
      language = options[:language] || 'English'
      "Target language: #{language}"
    end

    def assistant
      @assistant ||= AI::Assistant.translation_assistant.last ||
                     raise(StandardError, I18n.t('admin.translation_assistant_not_configured'))
    end

    def chat
      @chat ||= assistant.for_user(user)
    end
  end
end
