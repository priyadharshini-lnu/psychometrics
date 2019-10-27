# frozen_string_literal: true

module Threesixty
  class CurrentUserSerializer < ActiveModel::Serializer
    attributes :id, :is_manager, :email, :first_name, :last_name, :is_super_admin

    def is_manager # rubocop:disable Naming/PredicateName
      true
    end

    def is_super_admin # rubocop:disable Naming/PredicateName
      object.superadmin?
    end
  end
end
