# frozen_string_literal: true

module EndUser
  class UserIdpDevelopmentActionsSerializer < Panko::Serializer
    attributes :id, :name, :description, :user_idp_skill_id, :custom_action, :progress, :start_date_time,
               :end_date_time, :private

    def name
      development_action&.name
    end

    def description
      development_action&.description
    end

    private

    def development_action
      object.development_action
    end
  end
end
