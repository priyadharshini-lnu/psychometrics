# frozen_string_literal: true

class EndUser::MeetingRoomsController < ApplicationController
  before_action :set_meeting_room

  def token
    result = ::DailyCo::CreateMeetingToken.call!(@meeting_room, current_user)
    if result.present?
      render json: result, status: :ok
    else
      render json: { error: 'Unauthorized' }, status: :unauthorized
    end
  end

  private

  def set_meeting_room
    @meeting_room = MeetingRoom.find(params[:id])
  end
end
