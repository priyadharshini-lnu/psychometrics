# frozen_string_literal: true

module Api
  module Administration
    class WorkshopRecordingPolicy < ::Administration::BasePolicy
      def index?
        has_permission?(:workshops, :view_recordings) ||
          user.superadmin? ||
          Workshop.accessible_as_assessor_or_manager(user).exists?(id: record.id)
      end
    end
  end
end
