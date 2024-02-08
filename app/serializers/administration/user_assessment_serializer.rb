# frozen_string_literal: true

module Administration
  class UserAssessmentSerializer < Panko::Serializer
    attributes :id, :permissions, :assessment_id, :name, :category, :norm_name, :status, :norms, :norm_id,
               :additional_time, :is_expired, :is_external, :has_external_norm, :schedule_time, :require_scheduling

    delegate :name, :category, to: :assessment

    def status
      return :not_started if user_result.nil?

      user_result.real_status
    end

    def norms
      return assessment.external_norms if assessment.has_external_norm?

      assessment.norms.map { |n| NormSerializer.new.serialize(n) }
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
      context[:campaign]
    end

    def current_user
      context[:current_user]
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
