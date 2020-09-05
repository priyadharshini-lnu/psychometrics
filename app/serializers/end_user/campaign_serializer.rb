# frozen_string_literal: true

module EndUser
  class CampaignSerializer < ActiveModel::Serializer
    include Rails.application.routes.url_helpers
    attributes :id, :name, :type, :status

    has_many :user_assessments, serializer: ::EndUser::UserAssessmentSerializer

    def user_assessments
      UserAssessment.where(evaluator_id: current_user.id, campaign_id: object.id)
    end

    def current_user
      @current_user ||= instance_options[:current_user]
    end
  end
end
