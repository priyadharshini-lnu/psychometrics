# frozen_string_literal: true

module Api
  module V2
    module ProjectAssessment
      class Contract < Api::Base::Contract
        rule(data: { attributes: :user_result_validity_in_days }) do
          if value && value.to_i <= 0
            key.failure(text: I18n.t('dry_errors.errors.project_assessments.should_be_greater_than_zero'))
          end
        end
      end
    end
  end
end
