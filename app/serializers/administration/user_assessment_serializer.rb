# frozen_string_literal: true

module Administration
  class UserAssessmentSerializer < ActiveModel::Serializer
    attributes :id, :permissions, :assessment_id, :name, :category, :norm_name, :status, :norms, :norm_id,
               :additional_time, :is_expired, :is_external, :has_external_norm

    delegate :name, :category, to: :assessment

    def status
      return :not_started if user_result.nil?

      user_result.real_status
    end

    def norms
      return assessment.external_norms if assessment.has_external_norm?

      assessment.norms.map { |n| NormSerializer.new(n).to_h }
    end

    def is_expired
      object.expired?
    end

    def has_external_norm
      assessment.has_external_norm?
    end

    def is_external
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
          'reset_progress',
          'push_webhook',
          %w[reset_results reset]
        ],
        {
          project_id: campaign.project_id,
          campaign_id: campaign.id
        }
      )
    end

    private

    def campaign
      instance_options[:campaign]
    end

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
