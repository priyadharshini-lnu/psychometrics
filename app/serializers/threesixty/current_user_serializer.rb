# frozen_string_literal: true

module Threesixty
  class CurrentUserSerializer < ActiveModel::Serializer
    attributes :id, :is_manager, :email, :first_name, :last_name

    def is_manager # rubocop:disable Naming/PredicateName
      true
    end
  end
end
