# frozen_string_literal: true

module Api
  module Administration
    class TenantRepairPolicy
      attr_reader :user

      def initialize(user, _record, _extra_params = {})
        @user = user
      end

      def search_models?
        @user.support_admin?
      end

      def preview?
        @user.support_admin?
      end

      def update_tenant?
        @user.support_admin?
      end
    end
  end
end
