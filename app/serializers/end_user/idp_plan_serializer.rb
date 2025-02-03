# frozen_string_literal: true

module EndUser
  class IdpPlanSerializer < Panko::Serializer
    attributes :status

    has_many :user_idp_skills,
             serializer: EndUser::UserIdpSkillsSerializer

    has_many :user_idp_development_actions,
             serializer: EndUser::UserIdpDevelopmentActionsSerializer
  end
end
