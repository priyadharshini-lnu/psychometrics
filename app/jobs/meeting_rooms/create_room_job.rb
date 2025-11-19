# frozen_string_literal: true

module MeetingRooms
  class CreateRoomJob < ApplicationJob
    queue_as :default

    def perform(meeting_room)
      result = ::DailyCo::CreateRoom.call!(meeting_room)
      meeting_room.update!(
        external_id: result[:id],
        name: result[:name],
        transcription_enabled: result[:transcription_enabled]
      )
    end
  end
end
