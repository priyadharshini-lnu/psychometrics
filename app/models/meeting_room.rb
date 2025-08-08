# frozen_string_literal: true

class MeetingRoom < ApplicationRecord
  self.implicit_order_column = :created_at

  belongs_to :meetable, polymorphic: true

  has_many :meeting_recordings, dependent: :destroy

  after_create_commit :create_room

  def get_role(current_user)
    "::MeetingRooms::#{meetable_type}".safe_constantize.new(meetable).get_role(current_user)
  end

  def meeting_room_name
    "::MeetingRooms::#{meetable_type}".safe_constantize.new(meetable).meeting_room_name
  end

  def video_recording_enabled?
    "::MeetingRooms::#{meetable_type}".safe_constantize.new(meetable).video_recording_enabled?
  end

  private

  def create_room
    ::MeetingRooms::CreateRoomJob.perform_later(self)
  end
end
