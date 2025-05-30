# frozen_string_literal: true

module EndUser
  class AvailableDevelopmentActionSerializer < Panko::Serializer
    attributes :id, :name, :description, :development_action_type, :learning_style, :image

    private

    def image
      object.image.url
    end
  end
end
