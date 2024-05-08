# frozen_string_literal: true

module Reports
  class UserSerializer < Panko::Serializer
    attributes :id, :first_name, :last_name, :email, :photo

    def photo
      object.user_profile.photo&.url
    end
  end
end
