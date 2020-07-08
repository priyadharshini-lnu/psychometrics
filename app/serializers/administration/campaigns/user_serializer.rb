# frozen_string_literal: true

module Administration
  module Campaigns
    class UserSerializer < ActiveModel::Serializer
      attributes :id, :first_name, :last_name, :email, :created_by, :created_at, :updated_by, :updated_at

      def created_at
        I18n.l object.created_at, format: :short
      end

      def created_by
        object.creator&.email
      end

      def updated_at
        I18n.l object.updated_at, format: :short
      end

      def updated_by
        object.modifier&.email
      end
    end
  end
end
