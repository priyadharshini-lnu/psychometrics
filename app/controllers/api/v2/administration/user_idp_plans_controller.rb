# frozen_string_literal: true

module Api
  class V2::Administration::UserIdpPlansController < Api::V2::Administration::BaseController
    validate_crud_requests Api::V2::UserIdpPlan::Schema
    validates_request_schema :create, Api::V2::UserIdpPlan::CreateContract.new
    append_before_action :deactivate_existing_plans

    def create
      user_id = user_idp_plan_params[:user_id]
      idp_template_id = user_idp_plan_params[:idp_template_id]
      campaign_id = user_idp_plan_params[:campaign_id]

      existing_plan = UserIdpPlan.find_by(user_id: user_id, idp_template_id: idp_template_id, campaign_id: campaign_id)

      if existing_plan
        existing_plan.update!(active: true)
        jsonapi_render json: existing_plan, status: :created
      else
        super
      end
    end

    private

    def user_idp_plan_params
      params.require(:data).require(:attributes).permit(:user_id, :idp_template_id, :campaign_id, :creator_id)
    end

    def deactivate_existing_plans
      UserIdpPlan.active.where(user_id: user_idp_plan_params[:user_id]).update_all(active: false)
    end
  end
end
