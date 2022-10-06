
# frozen_string_literal: true

class UserWithAllFieldsSerializer < ActiveModel::Serializer
  attributes :id, :first_name, :last_name, :email, :age, :gender, :timezone, :locale, :custom_fields

  delegate :age, :gender, :timezone, :locale, to: :user_profile

  def custom_fields
    Users::GetCustomProfileFields.call!(object)
  end

  private

  def user_profile
    object.user_profile
  end
end
