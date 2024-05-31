# frozen_string_literal: true

module SuperAdmin
  module ExportExternalAssessment
    class Base < BaseCommand
      private_attr_accessor :users_results, :assessment

      def initialize(users_results, assessment)
        @users_results = users_results
        @assessment = assessment
      end
    end
  end
end
