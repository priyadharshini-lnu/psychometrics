# frozen_string_literal: true

module Api
  module Administration
    class ClientFeaturePolicy < Administration::BasePolicy
      def update?
        @user.is?(:superadmin)
      end

      def index?
        @user.is?(:superadmin)
      end
    end
  end
end
