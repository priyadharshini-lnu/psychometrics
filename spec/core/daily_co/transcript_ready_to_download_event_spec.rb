# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DailyCo::TranscriptReadyToDownloadEvent do
  let(:meeting_room) { MeetingRoom.create!(name: 'test-room', meetable: FactoryBot.create(:workshop)) }

  before do
    allow(Settings).to receive(:storage).and_return(
      double('storage',
             dailyco_storage_service: :test,
             public_storage_service: :test,
             private_storage_service: :test)
    )
  end

  let(:payload) do
    {
      'room_name' => meeting_room.name,
      'mtg_session_id' => 'session-123',
      'status' => 't_finished',
      'id' => 'transcript-456',
      'out_params' => {
        's3' => {
          'key' => 'some/s3/transcription/key.vtt'
        }
      }
    }
  end

  it 'creates or updates a MeetingRecording with transcript ready info' do
    DailyCo::TranscriptReadyToDownloadEvent.process(payload)
    recording = MeetingRecording.find_by(meeting_room: meeting_room, meeting_session_id: 'session-123')
    expect(recording.transcription_status).to eq('t_finished')
    expect(recording.transcription_s3key).to eq('some/s3/transcription/key.vtt')
    expect(recording.transcription_external_id).to eq('transcript-456')
  end

  it 'logs a warning if room is not found' do
    expect(Rails.logger).to receive(:warn).with('MeetingRoom not found for name: unknown-room')
    DailyCo::TranscriptReadyToDownloadEvent.process(payload.merge('room_name' => 'unknown-room'))
  end
end
