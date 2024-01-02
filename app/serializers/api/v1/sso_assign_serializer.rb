# frozen_string_literal: true

module Api
  module V1
    class SsoAssignSerializer < Panko::Serializer
      attributes :id, :icon_url, :poster_url, :description, :campaign_id, :name, :url, :status

      delegate :id, :name, :description, to: :assessment

      def icon_url
        assessment.icon.url
      end

      def poster_url
        assessment.poster.url
      end

      def url
        "#{context[:url]}?user_assessment_id=#{object.id}"
      end

      delegate :status, to: :object

      private

      def assessment
        object.assessment
      end
    end
  end
end
