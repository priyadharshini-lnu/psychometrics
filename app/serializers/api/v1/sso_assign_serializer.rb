# frozen_string_literal: true

module Api
  module V1
    class SsoAssignSerializer < ActiveModel::Serializer
      attributes :id, :icon_url, :poster_url, :description, :campaign_id, :name, :url, :status

      delegate :id, :name, :description, to: :assessment

      def icon_url
        assessment.icon.url
      end

      def poster_url
        assessment.poster.url
      end

      def url
        "#{instance_options[:url]}?user_assessment_id=#{object.id}"
      end

      def status
        object.status
      end

      private

      def assessment
        object.assessment
      end
    end
  end
end
