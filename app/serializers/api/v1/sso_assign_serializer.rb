# frozen_string_literal: true

module Api
  module V1
    class SsoAssignSerializer < ActiveModel::Serializer
      attributes :id, :campaign_id, :name, :url, :status
      def id
        object.assessment.id
      end

      def name
        object.assessment.name
      end

      def url
        "#{instance_options[:url]}?user_assessment_id=#{object.id}"
      end

      def status
        object.status
      end
    end
  end
end
