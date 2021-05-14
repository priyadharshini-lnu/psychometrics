# frozen_string_literal: true

module Api
  module V1
    class UserAssessmentSerializer < ActiveModel::Serializer
      attributes :id, :name, :status, :started_at, :completed_at, :campaign_id

      def id
        object.assessment.id
      end

      def status
        object.users_result.status
      end

      def started_at
        object.users_result.started_at
      end

      def completed_at
        object.users_result.completed_at
      end

      def name
        object.assessment.name
      end
    end
  end
end
