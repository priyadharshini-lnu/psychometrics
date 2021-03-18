# frozen_string_literal: true

module Assessors
  class UsersResultPolicy < BasePolicy
    def update?
      @user.is?(:assessor)
    end

    def upload_media_url?
      update?
    end

    def scoring?
      update?
    end

    def remove_media?
      update?
    end

    def complete_multipart_upload?
      update?
    end

    def mark_as_user_selected_take?
      update?
    end

    def update_meta_data?
      update?
    end

    class Scope
      attr_reader :user, :scope

      def initialize(user, scope)
        @user = user
        @scope = [scope].flatten.last
      end

      def resolve
        scope
      end
    end
  end
end
