# frozen_string_literal: true

module Assessments
  module QuestionsImport
    class Base < Rectify::Form
      def attributes
        return super unless respond_to?(:default_values)

        super.deep_merge(default_values)
      end
    end
  end
end
