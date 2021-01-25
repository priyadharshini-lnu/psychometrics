# frozen_string_literal: true

module Administration
  module Assessors
    class UserAssessmentSerializer < ActiveModel::Serializer
      attributes :id, :assessment_name, :status

      delegate :name, to: :assessment, prefix: true

      def status
        object.users_result.status
      end

      private

      def assessment
        object.assessment
      end
    end
  end
end
