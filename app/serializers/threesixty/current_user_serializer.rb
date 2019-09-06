module Threesixty
  class CurrentUserSerializer < ActiveModel::Serializer
    attributes :id, :is_manager, :email, :first_name, :last_name

    def is_manager
      true
    end
  end
end
