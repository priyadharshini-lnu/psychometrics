# frozen_string_literal: true

module Api
  module Administration
    class RecordChangeHistoryPolicy
      attr_reader :user

      def initialize(user, _record, _extra_params = {})
        @user = user
      end

      def index?
        @user.support_admin?
      end

      def auditable_types?
        @user.support_admin?
      end

      def export?
        @user.support_admin?
      end

      def revision?
        @user.support_admin?
      end

      def search?
        @user.support_admin?
      end
    end
  end
end
