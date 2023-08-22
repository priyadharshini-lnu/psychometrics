# frozen_string_literal: true

module Api
  module Administration
    class WorkshopActivityPolicy < ::Administration::BasePolicy
      def index?
        has_permission?(:workshops, :view) || user.assessor?
      end
    end
  end
end
