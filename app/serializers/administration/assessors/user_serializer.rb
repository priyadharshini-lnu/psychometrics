# frozen_string_literal: true

module Administration
  module Assessors
    class UserSerializer < ActiveModel::Serializer
      attributes :id, :email, :full_name

      def full_name
        object.decorate.full_name
      end
    end
  end
end
