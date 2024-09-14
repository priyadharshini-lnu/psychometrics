# frozen_string_literal: true

class UsersAssessmentSerializer < Panko::Serializer
  attributes :id, :user_id, :assessment_id, :campaign_id
end
