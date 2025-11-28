# frozen_string_literal: true

require 'rails_helper'

RSpec.describe MeetingRecording, type: :model do
  let(:meeting_room) { MeetingRoom.create!(meetable: FactoryBot.create(:workshop)) }

  subject do
    described_class.new(
      meeting_room: meeting_room,
      external_id: 'abc123',
      status: :started,
      transcription_status: :not_enabled
    )
  end

  it 'is valid with valid attributes' do
    expect(subject).to be_valid
  end

  it 'is not valid without external_id when status is finished' do
    subject.status = :finished
    subject.external_id = nil
    expect(subject).not_to be_valid
  end

  it 'is not valid without s3key when status is finished' do
    subject.status = :finished
    subject.s3key = nil
    expect(subject).not_to be_valid
  end

  it 'is not valid without transcription_external_id when transcription_status is t_finished' do
    subject.transcription_status = :t_finished
    subject.transcription_external_id = nil
    expect(subject).not_to be_valid
  end

  it 'is not valid without transcription_s3key when transcription_status is t_finished' do
    subject.transcription_status = :t_finished
    subject.transcription_s3key = nil
    expect(subject).not_to be_valid
  end

  it 'belongs to meeting_room' do
    expect(subject.meeting_room).to eq(meeting_room)
  end

  it 'has enum status' do
    expect(MeetingRecording.statuses.keys).to include('started', 'stopped', 'finished', 'failed')
  end

  it 'has enum transcription_status' do
    expect(MeetingRecording.transcription_statuses.keys).to include('not_enabled', 't_in_progress', 't_finished',
                                                                    't_error')
  end
end
