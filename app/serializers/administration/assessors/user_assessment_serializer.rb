# frozen_string_literal: true

module Administration
  module Assessors
    class UserAssessmentSerializer < Panko::Serializer
      attributes :id, :assessment_id, :assessment_name, :status, :responses_count

      delegate :name, to: :assessment, prefix: true

      def status
        context[:status]
      end

      def responses_count
        context[:responses_count]
      end

      private

      def assessment
        object.assessment
      end
    end
  end
end
