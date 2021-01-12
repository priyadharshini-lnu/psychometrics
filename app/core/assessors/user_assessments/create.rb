# frozen_string_literal: true

module Assessors
  module UserAssessments
    class Create < BaseCommand
      private_attr_reader :form

      def initialize(form)
        @form = form
      end

      def call
        user_result = UsersResult.create!(form.attributes.slice(:subject_id, :evaluator_id, :assessment_id))
        user_assessment = UserAssessment.create!(form.attributes.merge(users_result_id: user_result.id))

        broadcast :ok, user_assessment
      end
    end
  end
end
