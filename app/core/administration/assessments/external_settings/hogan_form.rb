# frozen_string_literal: true

module Administration
  module Assessments
    module ExternalSettings
      class HoganForm < BaseForm
        attribute :assessment_id, Integer
        attribute :form_id,       String

        validates :assessment_id, :form_id, presence: true

        private

        def form_id
          return unless assessment

          Settings.providers.hogan.assessments.detect { |i| i.id == assessment_id&.upcase }&.form_id
        end
      end
    end
  end
end
