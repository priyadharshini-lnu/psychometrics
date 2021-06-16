# frozen_string_literal: true

module Administration
  class UserAssessmentSerializer < ActiveModel::Serializer
    attributes :id, :permissions, :assessment_id, :name, :category, :norm_name, :status, :norms, :norm_id,
               :additional_time, :is_expired, :is_external, :is_saville

    delegate :name, :category, to: :assessment

    def status
      return :not_started if user_result.nil?

      user_result.real_status
    end

    def norms
      return assessment.saville_norms if assessment.saville?

      assessment.norms.map { |n| NormSerializer.new(n).to_h }
    end

    def norm_id
      user_result&.norm_id
    end

    def additional_time
      user_result&.additional_time
    end

    def is_expired # rubocop:disable Naming/PredicateName
      user_result&.expired?
    end

    def is_saville # rubocop:disable Naming/PredicateName
      assessment.saville?
    end

    def is_external # rubocop:disable Naming/PredicateName
      assessment.external?
    end

    def permissions
      GetPermissionsHash.call!(
        Administration::UserAssessmentPolicy,
        current_user,
        object,
        [
          'update_additional_time',
          'update_norm',
          'rescore_response',
          %w[remove destroy],
          %w[reset_results reset]
        ]
      )
    end

    private

    def current_user
      instance_options[:current_user]
    end

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
