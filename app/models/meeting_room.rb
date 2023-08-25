# frozen_string_literal: true

class MeetingRoom < ApplicationRecord
  self.implicit_order_column = :created_at

  belongs_to :meetable, polymorphic: true

  after_create_commit :create_room

  def get_role(current_user)
    "::MeetingRooms::#{meetable_type}".safe_constantize.new(meetable, current_user).get_role
  end

  private

  def create_room
    ::MeetingRooms::CreateRoomJob.perform_later(self)
  end
end
