# frozen_string_literal: true

module Administration
  module Campaigns
    class ReportSerializer < Panko::Serializer
      attributes :id, :name, :icon_url, :icon_color

      def icon_url
        object.icon_url(:thumb) if object.icon.attached?
      end
    end
  end
end
