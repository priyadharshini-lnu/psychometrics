# frozen_string_literal: true

module Api
  class V2::Administration::Projects::IdpTemplatesController < Api::V2::Administration::BaseController
    before_action :set_user_idp_plan, only: %i[update destroy]

    def update
      return super if @user_idp_plan.blank?

      render json: {
        error: 'Update not allowed because the IDP template is already associated with a user IDP plan.'
      }, status: :bad_request
    end

    def destroy
      if @user_idp_plan.blank?
        super
        head :no_content
      else
        render json: {
          error: 'Deletion not allowed because the IDP template is already associated with a user IDP plan.'
        }, status: :bad_request
      end
    end

    private

    def set_user_idp_plan
      @user_idp_plan = UserIdpPlan.find_by(idp_template_id: params[:id])
    end
  end
end
