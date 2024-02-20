# frozen_string_literal: true

module Administration
  module Campaigns
    class AssessmentSerializer < Panko::Serializer
      attributes :id, :name, :icon_url, :icon_color

      def icon_url
        object.icon.url(:thumb) if object.icon?
      end
    end
  end
end
