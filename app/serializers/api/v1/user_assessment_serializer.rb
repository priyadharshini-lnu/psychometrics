# frozen_string_literal: true

module Api
  module V1
    class UserAssessmentSerializer < Panko::Serializer
      attributes :id, :name, :description, :icon_url, :poster_url, :status, :started_at, :completed_at, :campaign_id,
                 :norm_id

      delegate :id, :name, :description, to: :assessment

      def icon_url
        assessment.icon.url
      end

      def poster_url
        assessment.poster.url
      end

      def status
        object.users_result.status
      end

      def completed_at
        object.users_result.completed_at
      end

      private

      def assessment
        object.assessment
      end
    end
  end
end
