# frozen_string_literal: true

module Idp
  class AssignUserIdp < BaseCommand
    attr_accessor :user, :idp_template_id, :campaign_id, :creator

    def initialize(user, idp_template_id, campaign_id, creator = nil)
      @user = user
      @idp_template_id = idp_template_id
      @campaign_id = campaign_id
      @creator = creator
    end

    def call
      existing_idp = user.user_idp_plans.find_by(campaign_id: campaign_id, idp_template_id: idp_template_id)

      new_user_plan = assign_idp_plan(existing_idp)

      broadcast :ok, new_user_plan
    end

    private

    def assign_idp_plan(current_plan)
      user.user_idp_plans.where(campaign_id: campaign_id).update_all(active: false)

      if current_plan
        current_plan.update!(active: true)
        current_plan
      else
        transaction do
          campaign = Campaign.find(campaign_id)
          idp_plan = user.user_idp_plans.create(idp_template_id: idp_template_id, campaign_id: campaign_id,
                                                active: true, creator_id: creator&.id)
          Licenses::IdpUse.call!(campaign, user, idp_plan)
          idp_plan
        end
      end
    end
  end
end
