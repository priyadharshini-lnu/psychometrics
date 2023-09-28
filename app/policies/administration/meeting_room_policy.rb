# frozen_string_literal: true

module Administration
  class MeetingRoomPolicy < Administration::BasePolicy
    def token?
      true
    end
  end
end
