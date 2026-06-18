# frozen_string_literal: true

module UsersResults
  class CanReset < BaseCommand
    private_attr_reader :user_assessment, :user, :project_id, :campaign_id

    def initialize(user_assessment, user, project_id:, campaign_id:)
      @user_assessment = user_assessment
      @user = user
      @project_id = project_id
      @campaign_id = campaign_id
    end

    def call
      return broadcast(:ok, false) unless user_has_permission?
      return broadcast(:ok, false) unless assessment_can_be_reset?

      broadcast(:ok, true)
    end

    private

    def user_has_permission?
      user.has_permission?(
        :results, :reset_responses,
        project_id: project_id,
        campaign_id: campaign_id
      )
    end

    def assessment_can_be_reset?
      assessment = user_assessment.assessment

      always_resettable_assessment?(assessment) ||
        mettl_assessment_resettable?(assessment) ||
        iiht_assessment_resettable?(assessment)
    end

    def always_resettable_assessment?(assessment)
      assessment.common? ||
        assessment.saville? ||
        assessment.simulation? ||
        assessment.skillvue? ||
        assessment.yoodli? ||
        assessment.mhs? ||
        assessment.microsite?
    end

    def mettl_assessment_resettable?(assessment)
      assessment.mettl? &&
        user_assessment.reset_count < UserAssessment::MAX_RESET_COUNT &&
        user_assessment.completed?
    end

    def iiht_assessment_resettable?(assessment)
      assessment.iiht? && user_assessment.completed?
    end
  end
end
