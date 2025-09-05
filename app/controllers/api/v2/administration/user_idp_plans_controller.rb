# frozen_string_literal: true

module Api
  class V2::Administration::UserIdpPlansController < Api::V2::Administration::BaseController
    skip_before_action :enforce_geo_restriction
    validate_crud_requests Api::V2::UserIdpPlan::Schema
    validates_request_schema :create, -> { Api::V2::UserIdpPlan::CreateContract.new }

    def create
      user = User.find(user_idp_plan_params[:user_id])
      idp_template_id = user_idp_plan_params[:idp_template_id]
      campaign_id = user_idp_plan_params[:campaign_id]

      user_plan = Idp::AssignUserIdp.call!(user, idp_template_id, campaign_id, current_user)

      jsonapi_render json: user_plan, status: :created
    rescue Licenses::NotEnoughError => e
      render json: { error: e.message }, status: :unprocessable_entity
    end

    private

    def user_idp_plan_params
      params.require(:data).require(:attributes).permit(:user_id, :idp_template_id, :campaign_id, :creator_id,
                                                        :overwrite)
    end
  end
end
