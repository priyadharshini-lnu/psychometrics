# frozen_string_literal: true

module Administration
  class UserAssessmentSerializer < ActiveModel::Serializer
    attributes :id, :assessment_id, :name, :category, :norm_name, :status, :norms, :norm_type, :norm_id

    delegate :name, :category, to: :assessment

    def status
      return :not_started if user_result.nil?

      user_result.status
    end

    def norms
      object.assessment.norms.map { |n| NormSerializer.new(n).to_h }
    end

    def norm_name
      user_result&.norm&.name
    end

    def norm_type
      user_result&.norm_type
    end

    def norm_id
      user_result&.norm_id
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
