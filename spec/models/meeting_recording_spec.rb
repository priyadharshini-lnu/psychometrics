# frozen_string_literal: true

require 'rails_helper'

RSpec.describe MeetingRecording, type: :model do
  let(:meeting_room) { MeetingRoom.create!(meetable: FactoryBot.create(:workshop)) }

  subject do
    described_class.new(
      meeting_room: meeting_room,
      external_id: 'abc123',
      status: :started
    )
  end

  it 'is valid with valid attributes' do
    expect(subject).to be_valid
  end

  it 'is not valid without external_id' do
    subject.external_id = nil
    expect(subject).not_to be_valid
  end

  it 'belongs to meeting_room' do
    expect(subject.meeting_room).to eq(meeting_room)
  end

  it 'has enum status' do
    expect(MeetingRecording.statuses.keys).to include('started', 'stopped', 'finished', 'failed')
  end
end
