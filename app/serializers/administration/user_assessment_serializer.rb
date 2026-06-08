# frozen_string_literal: true

module Administration
  class UserAssessmentSerializer < Panko::Serializer
    attributes :id, :permissions, :assessment_id, :name, :category, :norm_name, :status, :norms, :norm_id,
               :additional_time, :is_expired, :is_external, :has_external_norm, :schedule_time, :require_scheduling,
               :mettl_schedule_name, :mettl_schedule_record_id, :dimension_id, :simulation_content_variations,
               :users_result_id, :hogan_participant_id, :prework, :started_at, :completed_at,
               :hogan_user_assessment_details, :saville_user_assessment_details,
               :simulation_user_assessment_details, :pearson_user_assessment_details,
               :skillvue_user_assessment_details, :yoodli_user_assessment_details, :mhs_user_assessment_details,
               :microsite_user_assessment_details

    delegate :name, :category, :dimension_id, to: :assessment

    def status
      return :not_started if user_result.nil?

      user_result.real_status
    end

    def norms
      return assessment.external_norms if assessment.has_external_norm?

      assessment.norms.map { |n| NormSerializer.new.serialize(n) }
    end

    def simulation_content_variations
      assessment.simulation_settings&.content_variations || []
    end

    def hogan_participant_id
      return nil unless object.hogan?

      object.hogan_credential&.participant_id
    end

    def is_expired
      object.expired?
    end

    def has_external_norm
      assessment.has_external_norm?
    end

    def mettl_schedule_name
      mettl_schedule_record&.schedule_name
    end

    def mettl_schedule_record_id
      mettl_schedule_record&.id&.to_s
    end

    def is_external
      assessment.external?
    end

    def saville_user_assessment_details
      return nil unless object.saville?

      Administration::SavilleUserAssessmentSerializer.new.serialize(object.saville_user_assessment)
    end

    def hogan_user_assessment_details
      return nil unless object.hogan?

      Administration::HoganUserAssessmentSerializer.new.serialize(object)
    end

    def simulation_user_assessment_details
      return nil unless object.simulation?

      Administration::SimulationUserAssessmentSerializer.new.serialize(object.simulation_user_assessment)
    end

    def pearson_user_assessment_details
      return nil unless object.pearson?

      Administration::PearsonUserAssessmentSerializer.new.serialize(object.pearson_user_assessment)
    end

    def skillvue_user_assessment_details
      return nil unless object.skillvue?

      Administration::SkillvueUserAssessmentSerializer.new.serialize(object.skillvue_user_assessment)
    end

    def yoodli_user_assessment_details
      return nil unless object.yoodli?

      Administration::YoodliUserAssessmentSerializer.new.serialize(object.yoodli_user_assessment)
    end

    def mhs_user_assessment_details
      return nil unless object.mhs?

      Administration::MhsUserAssessmentSerializer.new.serialize(object.mhs_user_assessment)
    end

    def microsite_user_assessment_details
      return nil unless object.microsite?

      Administration::MicrositeUserAssessmentSerializer.new.serialize(object.microsite_user_assessment)
    end

    def permissions
      GetPermissionsHash.call!(
        Administration::UserAssessmentPolicy,
        current_user,
        object,
        [
          'update_additional_time',
          'update_norm',
          'update_mettl_schedule',
          'update_content_variation',
          'update_simulation_time_extension',
          'toggle_require_scheduling',
          'toggle_prework',
          'rescore_response',
          'rescore_ai_response',
          %w[remove destroy],
          'reset_progress',
          'push_webhook',
          'mark_complete',
          'normalize_factor_scores',
          'update_mhs_confidence_interval',
          'update_mhs_leadership_bar',
          'update_mhs_norm_region',
          'update_mhs_norm_option',
          %w[reset_results reset]
        ],
        {
          project_id: campaign.project_id,
          campaign_id: campaign.id
        }
      )
    end

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

    delegate :assessment, to: :object

    private

    def mettl_schedule_record
      return nil if object.mettl_user_assessment.blank?

      object.mettl_user_assessment&.mettl_schedule_record&.parent_or_self
    end
  end
end
