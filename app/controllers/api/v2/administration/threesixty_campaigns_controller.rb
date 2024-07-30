# frozen_string_literal: true

module Api
  class V2::Administration::ThreesixtyCampaignsController < Api::V2::Administration::BaseController
    validate_crud_requests Api::V2::ThreesixtyCampaign::Schema

    def create_campaign
      form = ::Threesixty::Campaigns::CreateForm.from_params(params[:data][:attributes])
      unless form.valid?
        return jsonapi_render_errors(form.errors, status: :unprocessable_entity)
      end

      @result = ::Threesixty::Campaigns::Create.call(project, form, current_user)

      if @result[:ok]
        audit! :create, @result[:model], payload: params, campaign: @result[:model]
        jsonapi_render json: @result[:ok], status: :created
      else
        jsonapi_render_errors @result[:errors], status: :unprocessable_entity
      end
    end

    def policy_class
      ::Api::Administration::ThreesixtyCampaignPolicy
    end
  end
end
