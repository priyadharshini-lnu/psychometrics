# frozen_string_literal: true

module Api
  module Administration
    class SubjectMeetingRecordingPolicy < ::Administration::BasePolicy
      def index?
        has_permission?(:workshops, :view_recordings)
      end
    end
  end
end
