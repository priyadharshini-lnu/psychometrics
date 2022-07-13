# frozen_string_literal: true

module Auth
  class CurrentUserSerializer < ActiveModel::Serializer
    attributes :email, :reset_password_token
  end
end
