# frozen_string_literal: true

require 'rails_helper'

RSpec.describe SystemCheckRecords::VerifyPhrase, type: :command do
  let(:system_check_session) { create(:system_check_session) }
  let(:phrase) { 'this is a test recording' }
  let(:matching_transcript) { [phrase, phrase, phrase].join(' ') }
  let(:mismatched_transcript) do
    ['completely different words here', 'nothing is matching now', 'totally unrelated speech'].join(' ')
  end

  def record_with_phrase(phrase)
    create(:system_check_record, :audio,
           system_check_session: system_check_session,
           data: { 'test_phrase' => phrase })
  end

  it 'delegates to PhraseVerifier with the test phrase from the record and the transcribed text' do
    record = record_with_phrase(phrase)

    expect(SystemCheckRecords::PhraseVerifier).to receive(:new).
      with(phrase, matching_transcript).
      and_call_original

    described_class.call(system_check_record: record, transcribed_text: matching_transcript)
  end

  context 'when transcript closely matches the test phrase' do
    it 'marks the record as passed and stores verification data' do
      record = record_with_phrase(phrase)
      result = described_class.call(system_check_record: record,
                                    transcribed_text: matching_transcript)

      expect(result[:ok]).to eq(record)
      expect(record.reload.passed).to be(true)
      expect(record.data['phrase_verification_status']).to eq('completed')
      expect(record.data['phrase_match_percentage']).to be > 80
      expect(record.data['transcribed_text']).to eq(matching_transcript)
    end
  end

  context 'when transcript does not match the test phrase' do
    it 'marks the record as failed and still broadcasts ok' do
      record = record_with_phrase(phrase)
      result = described_class.call(system_check_record: record,
                                    transcribed_text: mismatched_transcript)

      expect(result[:ok]).to eq(record)
      expect(record.reload.passed).to be(false)
      expect(record.data['phrase_verification_status']).to eq('completed')
    end
  end

  context 'when transcribed_text is blank' do
    it 'marks the record as failed and still broadcasts ok' do
      record = record_with_phrase(phrase)
      result = described_class.call(system_check_record: record, transcribed_text: '')

      expect(result[:ok]).to eq(record)
      expect(record.reload.passed).to be(false)
      expect(record.data['phrase_verification_status']).to eq('completed')
    end
  end

  context 'when an unexpected error occurs during update' do
    it 'stores error status in record data and re-raises the error' do
      record = record_with_phrase(phrase)
      record.update!(passed: true)
      allow(record).to receive(:update!).and_raise(StandardError, 'DB error')

      expect do
        described_class.call(system_check_record: record, transcribed_text: matching_transcript)
      end.to raise_error(StandardError, 'DB error')

      expect(record.reload.passed).to be(false)
      expect(record.data['phrase_verification_status']).to eq('error')
      expect(record.data['phrase_verification_error']).to eq('DB error')
    end
  end
end
