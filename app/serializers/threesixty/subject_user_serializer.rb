# frozen_string_literal: true

module Threesixty
  class SubjectUserSerializer < Panko::Serializer
    attributes :id, :first_name, :last_name, :email, :photo, :gender, :age, :current_job_role, :target_job_role,
               :is_uat

    delegate :user_profile, to: :object
    delegate :gender, :age, to: :user_profile

    def photo
      object.user_profile.photo&.url
    end

    def campaign_id
      context[:campaign_id]
    end

    def current_job_role
      campaign_user&.current_job_role&.name
    end

    def target_job_role
      campaign_user&.target_job_role&.name
    end

    def campaign_user
      CampaignUser.find_by(user_id: object.id, campaign_id: campaign_id)
    end
  end
end
