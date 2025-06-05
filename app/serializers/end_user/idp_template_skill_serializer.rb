# frozen_string_literal: true

module EndUser
  class IdpTemplateSkillSerializer < Panko::Serializer
    attributes :id, :name, :desired_rating, :min_rating, :max_rating, :score, :skill_type

    delegate :skill, to: :object
    delegate :name, :skill_type, to: :skill

    def score
      Idp::GetUserSkillScore.call!(user, object, campaign_factor_values, user_assessment_scores)
    end

    private

    def user
      context[:user]
    end

    def campaign_factor_values
      context[:campaign_factor_values]
    end

    def user_assessment_scores
      context[:user_assessment_scores]
    end

    def user_scorings
      context[:user_scorings]
    end

    def campaign
      context[:campaign]
    end
  end
end
