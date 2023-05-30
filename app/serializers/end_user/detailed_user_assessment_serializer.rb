# frozen_string_literal: true

module EndUser
  class DetailedUserAssessmentSerializer < ActiveModel::Serializer
    include Rails.application.routes.url_helpers
    attributes :id, :type, :url, :assessment_name, :timing, :assessment_category,
               :assessment_extra, :assessment_id, :available_locales,
               :selected_locale, :privacy_consent_required,
               :campaign_expiry_date, :is_timed_campaign, :campaign_id

    def privacy_consent_required
      current_user.privacy_consent_required?
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

    def campaign_expiry_date
      object.campaign.campaign_users.find_by(user_id: object.user_id).real_expiry_date
    end

    def is_timed_campaign
      object.campaign.timed?
    end

    def timing
      object.assessment.timing
    end

    def assessment_category
      object.assessment.category
    end
  end
end
