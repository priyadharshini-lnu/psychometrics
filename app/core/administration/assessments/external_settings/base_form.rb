# frozen_string_literal: true

module Administration
  module Assessments
    module ExternalSettings
      class BaseForm < Rectify::Form
        private

        def assessment
          @assessment ||= context&.assessment
        end
      end
    end
  end
end
