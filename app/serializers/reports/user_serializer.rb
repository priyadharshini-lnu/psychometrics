# frozen_string_literal: true

module Reports
  class UserSerializer < ActiveModel::Serializer
    attributes :id, :first_name, :last_name, :email
  end
end
