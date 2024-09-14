# frozen_string_literal: true

module Api
  module Administration
    class CampaignTemplatePolicy < ::Administration::BasePolicy
      def index?
        @user.is?(:superadmin)
      end

      def show?
        @user.is?(:superadmin)
      end

      def create?
        show?
      end

      def update?
        show?
      end
    end
  end
end
