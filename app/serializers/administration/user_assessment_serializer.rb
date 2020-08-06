# frozen_string_literal: true

module Administration
  class UserAssessmentSerializer < ActiveModel::Serializer
    attributes :id, :assessment_id, :name, :category, :norm_name, :status

    delegate :name, :category, to: :assessment
    delegate :name, to: :norm, prefix: true, allow_nil: true

    def status
      return :not_started if user_result.nil?

      user_result.status
    end

    private

    def norm
      user_result&.norm
    end

    def user_result
      object.users_result
    end

    def assessment
      object.assessment
    end
  end
end
