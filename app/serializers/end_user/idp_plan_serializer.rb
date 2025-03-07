# frozen_string_literal: true

module EndUser
  class IdpPlanSerializer < Panko::Serializer
    attributes :status, :self_rating_enabled
    delegate :self_rating_enabled, to: :idp_template

    has_many :user_idp_skills,
             serializer: EndUser::UserIdpSkillsSerializer

    has_many :user_idp_development_actions,
             serializer: EndUser::UserIdpDevelopmentActionsSerializer

    private

    def idp_template
      object.idp_template
    end
  end
end
