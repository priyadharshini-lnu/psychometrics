# frozen_string_literal: true

class IdpUserSerializer < Panko::Serializer
  attributes :id, :name, :email, :fields, :photo, :role

  def photo
    object.user_profile.photo&.url
  end

  def fields
    custom_fields.reject { |field| %w[role].include?(field[:name].to_s.downcase) }
  end

  def role
    custom_field_value('role')
  end

  private

  def custom_fields
    Users::GetCustomProfileFields.call!(object)
  end

  def custom_field_value(field_name)
    field = custom_fields.find { |f| f[:name].to_s.downcase == field_name.downcase }
    field&.fetch(:value, nil)
  end
end
