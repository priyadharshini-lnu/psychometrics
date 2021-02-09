# frozen_string_literal: true

module Projects
  class SearchUserSerializer < ActiveModel::Serializer
    attributes :id, :email, :first_name, :last_name, :locale
  end
end
