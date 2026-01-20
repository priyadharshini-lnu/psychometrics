# frozen_string_literal: true

class UserSerializer < Panko::Serializer
  # NOTE: object is not always a User here, sometimes it is a SheetRow.
  # Use safe navigation whenever you want to access any user properties.

  attributes :id, :first_name, :last_name, :email, :photo, :gender, :age

  delegate :user_profile, to: :object
  delegate :gender, :age, to: :user_profile, allow_nil: true

  def photo
    object.user_profile&.photo&.url
  end
end
