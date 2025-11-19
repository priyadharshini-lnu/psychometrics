# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DailyCo::RecordingReadyToDownloadEvent do
  let(:meeting_room) { MeetingRoom.create!(name: 'test-room', meetable: FactoryBot.create(:workshop)) }
  let(:s3_key) { 'domain/test-room/session-123/rec-456/1234567890.mp4' }
  let(:payload) do
    {
      'room_name' => meeting_room.name,
      'recording_id' => 'rec-456',
      'status' => 'finished',
      's3_key' => s3_key
    }
  end

  it 'creates or updates a MeetingRecording with recording ready info' do
    DailyCo::RecordingReadyToDownloadEvent.process(payload)
    recording = MeetingRecording.find_by(meeting_room: meeting_room, meeting_session_id: 'session-123')
    expect(recording.status).to eq('finished')
    expect(recording.s3key).to eq(s3_key)
    expect(recording.external_id).to eq('rec-456')
  end

  it 'logs a warning if room is not found' do
    expect(Rails.logger).to receive(:warn).with('MeetingRoom not found for name: unknown-room')
    DailyCo::RecordingReadyToDownloadEvent.process(payload.merge('room_name' => 'unknown-room'))
  end
end
