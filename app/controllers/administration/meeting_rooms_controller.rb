# frozen_string_literal: true

module Administration
  class MeetingRoomsController < Administration::BaseController
    prepend_before_action :set_resource_class
    before_action :set_resource
    append_before_action :pundit_authorize

    def token
      result = ::DailyCo::CreateMeetingToken.call!(@_resource, current_user)
      if result.present?
        render json: result, status: :ok
      else
        render json: { error: 'Unauthorized' }, status: :unauthorized
      end
    end

    private

    def set_resource
      @_resource = policy_scope(MeetingRoom).find(params[:id])
    end

    def set_resource_class
      @_resource_class ||= MeetingRoom # rubocop:disable Naming/MemoizedInstanceVariableName
    end
  end
end
