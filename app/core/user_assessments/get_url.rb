# frozen_string_literal: true

module UserAssessments
  class GetUrl < BaseCommand
    include Rails.application.routes.url_helpers
    private_attr_reader :user_assessment

    def initialize(user_assessment)
      @user_assessment = user_assessment
    end

    def call
      assessment = user_assessment.assessment
      url = agile_user_assessment_path(user_assessment) if assessment.agile?
      url = pass_mindmill_user_assessment_path(user_assessment) if assessment.mindmill?
      url = pass_hogan_user_assessment_path(user_assessment.id) if assessment.hogan?
      url = pass_saville_user_assessment_path(user_assessment.id) if assessment.saville?
      url = pass_pearson_user_assessment_path(user_assessment.id) if assessment.pearson?
      url = pass_iiht_user_assessment_path(user_assessment.id) if assessment.iiht?
      url = pass_mettl_user_assessment_path(user_assessment.id) if assessment.mettl?

      url ||= pass_user_assessment_path(user_assessment)

      broadcast :ok, url
    end
  end
end
