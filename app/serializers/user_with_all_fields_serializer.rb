# frozen_string_literal: true

class UserWithAllFieldsSerializer < Panko::Serializer
  attributes :id, :first_name, :last_name, :email, :age, :gender, :locale, :custom_fields, :photo

  delegate :age, :gender, :locale, to: :user_profile

  def photo
    object.user_profile.photo&.url
  end

  def custom_fields
    Users::GetCustomProfileFields.call!(object)
  end

  def locale
    return if user_profile.locale.nil?

    I18n.t("languages_localized.#{user_profile.locale}")
  end

  def gender
    return if user_profile.gender.nil?

    I18n.t("profile.#{user_profile.gender}")
  end

  private

  def user_profile
    object.user_profile
  end
end
