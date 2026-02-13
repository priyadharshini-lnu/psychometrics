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

      before do
        allow(media_response).to receive(:save_transcription_failed!)
        allow(media_response).to receive(:update!)
      end

      it 'broadcasts :ok and saves error details in a new transcription' do
        expect(media_response).to receive(:save_transcription_failed!).with({ message: 'Some error' })
        expect(subject).to receive(:broadcast).with(:ok).once
        subject.call
      end
    end

    context 'when status is completed' do
      let(:status) { 'completed' }

      before do
        allow(media_response).to receive(:save_transcription_completed!)
        allow(media_response).to receive(:update!)
      end

      it 'saves transcription, updates status, logs, and broadcasts :ok' do
        expect(media_response).to receive(:save_transcription_completed!).with('This is the transcription text.')
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
