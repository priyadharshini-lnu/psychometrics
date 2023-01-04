# frozen_string_literal: true

class ShortUserSerializer < ActiveModel::Serializer
  attributes :id, :full_name, :avatar_url

  def full_name
    object.decorate.full_name
  end

  def avatar_url
    nil
  end
end
