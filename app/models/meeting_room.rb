# frozen_string_literal: true

class MeetingRoom < ApplicationRecord
  self.implicit_order_column = :created_at

  belongs_to :meetable, polymorphic: true

  has_many :meeting_recordings, dependent: :destroy
  include Tenantable

  tenant_source :meetable

  after_create_commit :create_room

  def get_role(current_user)
    "::MeetingRooms::#{meetable_type}".safe_constantize.new(meetable).get_role(current_user)
  end

  def meeting_room_name
    "::MeetingRooms::#{meetable_type}".safe_constantize.new(meetable).meeting_room_name
  end

  def video_recording_enabled?
    "::MeetingRooms::#{meetable_type}".safe_constantize.new(meetable).video_recording_enabled? &&
      !Settings.features.disable_meeting_recording &&
      dailyco_api_version != 'v1'
  end

  def assessors
    "::MeetingRooms::#{meetable_type}".safe_constantize.new(meetable).assessors
  end

  def participants
    "::MeetingRooms::#{meetable_type}".safe_constantize.new(meetable).participants
  end

  def assessment_center_date_and_time
    "::MeetingRooms::#{meetable_type}".safe_constantize.new(meetable).assessment_center_date_and_time
  end

  private

  def create_room
    ::MeetingRooms::CreateRoomJob.perform_later(self)
  end
end
