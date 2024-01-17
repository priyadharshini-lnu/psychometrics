# frozen_string_literal: true

module Administration
  module Memberships
    class BaseSerializer < Panko::Serializer
      attributes :id, :user_id, :first_name, :last_name, :email, :created_at

      def created_at
        object.created_at && I18n.l(object.created_at, format: :short)
      end

      def first_name
        object.user.first_name
      end

      def last_name
        object.user.last_name
      end

      def email
        object.user.email
      end

      private

      def current_user
        context[:current_user]
      end
    end
  end
end
