# frozen_string_literal: true

module Auth
  class CurrentUserSerializer < Panko::Serializer
    attributes :email, :reset_password_token, :invitation_token
  end
end
