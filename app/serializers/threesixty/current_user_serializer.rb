module Threesixty
  class CurrentUserSerializer < ActiveModel::Serializer
    attributes :id, :is_manager

    def is_manager
      true
    end
  end
end
