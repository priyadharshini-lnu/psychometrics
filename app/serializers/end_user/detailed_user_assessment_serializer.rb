# frozen_string_literal: true

module EndUser
  class DetailedUserAssessmentSerializer < Panko::Serializer
    include Rails.application.routes.url_helpers
    attributes :id, :type, :url, :assessment_name, :timing, :assessment_category,
               :assessment_extra, :assessment_id, :available_locales,
               :selected_locale, :privacy_consent_required, :campaign_id

    def privacy_consent_required
      context[:current_user].privacy_consent_required?
    end

    def url
      UserAssessments::GetUrl.call!(object)
    end

    def type
      object.assessment.type
    end

    def user_id
      object.evaluator_id
    end

    def assessment_id
      object.assessment.id
    end

    def assessment_name
      object.assessment.name
    end

    def assessment_extra
      object.assessment.extra
    end

    def timing
      object.assessment.timing
    end

    def assessment_category
      object.assessment.category
    end
  end
end
