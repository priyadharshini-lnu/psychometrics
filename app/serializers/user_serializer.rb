# frozen_string_literal: true

class UserSerializer < Panko::Serializer
  attributes :id, :first_name, :last_name, :email, :photo, :gender, :age

  delegate :user_profile, to: :object
  delegate :gender, :age, to: :user_profile

  def photo
    object.user_profile.photo&.url
  end
end
