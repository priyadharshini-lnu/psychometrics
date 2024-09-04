# frozen_string_literal: true

module Administration
  class ManagerSerializer < Panko::Serializer
    attributes :id, :email, :name

    def name
      object&.decorate&.full_name
    end
  end
end
