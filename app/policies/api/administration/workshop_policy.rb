# frozen_string_literal: true

module Api
  module Administration
    class WorkshopPolicy < ::Administration::BasePolicy
      def index?
        has_permission?(:workshops, :view)
      end

      def show?
        has_permission?(:workshops, :view)
      end
    end
  end
end
