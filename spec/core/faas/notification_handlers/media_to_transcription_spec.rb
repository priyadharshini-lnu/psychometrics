# frozen_string_literal: true

require 'rails_helper'

describe Faas::NotificationHandlers::MediaToTranscription do
  let(:transcription) { 'This is the transcription text.' }
  let(:data) do
    {
      'status' => status,
      'error' => 'Some error',
      'meta' => {
        'record_id' => 42,
        'record_type' => 'MediaResponse'
      },
      'transcription' => transcription
    }
  end

  let(:media_response) { instance_double('MediaResponse', id: 42) }

  subject { described_class.new(data) }

  before do
    allow(MediaResponse).to receive(:find_by).and_return(media_response)
  end

  describe '#call' do
    context 'when status is failed' do
      let(:status) { 'failed' }

      it 'broadcasts :ok and does not save transcription' do
        expect(media_response).not_to receive(:create_transcription!)
        expect(media_response).to receive(:update!).with(transcription_status: :failed)
        expect(subject).to receive(:broadcast).with(:ok).once
        subject.call
      end
    end

    context 'when status is completed' do
      let(:status) { 'completed' }

      before do
        allow(media_response).to receive(:transcription).and_return(nil)
        allow(media_response).to receive(:create_transcription!)
        allow(media_response).to receive(:update!)
      end

      it 'saves transcription, updates status, logs, and broadcasts :ok' do
        expect(media_response).to receive(:create_transcription!).with(text: transcription)
        expect(media_response).to receive(:update!).with(transcription_status: :completed)
        expect(subject).to receive(:broadcast).with(:ok).once
        subject.call
      end
    end

    context 'when status is something else' do
      let(:status) { 'processing' }

      it 'broadcasts :ok and does nothing else' do
        expect(media_response).not_to receive(:create_transcription!)
        expect(media_response).not_to receive(:update!)
        expect(subject).to receive(:broadcast).with(:ok)
        subject.call
      end
    end
  end
end
