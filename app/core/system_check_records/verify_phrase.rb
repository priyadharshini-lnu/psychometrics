# frozen_string_literal: true

module SystemCheckRecords
  class VerifyPhrase < BaseCommand
    private_attr_reader :system_check_record, :transcribed_text

    def initialize(system_check_record:, transcribed_text:)
      @system_check_record = system_check_record
      @transcribed_text = transcribed_text
    end

    def call
      test_phrase = system_check_record.data&.dig('test_phrase').to_s
      result = PhraseVerifier.new(test_phrase, transcribed_text).call

      system_check_record.update!(
        passed: result.matched,
        data: (system_check_record.data || {}).merge(
          'transcribed_text' => transcribed_text,
          'phrase_matched' => result.matched,
          'phrase_match_percentage' => (result.score * 100).round(1),
          'phrase_verification_status' => 'completed'
        )
      )

      broadcast :ok, system_check_record
    rescue StandardError => e
      record_verification_error(e)
      raise
    end

    private

    def record_verification_error(error)
      system_check_record.update(
        passed: false,
        data: (system_check_record.data || {}).merge(
          'phrase_verification_status' => 'error',
          'phrase_verification_error'  => error.message
        )
      )
    end
  end
end
