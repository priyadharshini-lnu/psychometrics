# frozen_string_literal: true

module Administration
  module Assessments
    module ExternalSettings
      class SavilleForm < BaseForm
        attribute :assessment_id,       Integer
        attribute :norm_id,             String

        validates :assessment_id, :norm_id, presence: true

        private

        def norm_id
          Settings.providers.saville.assessments.find { |a| a.id.downcase == assessment_id }&.default_norm_id
        end
      end
    end
  end
end
