# frozen_string_literal: true

module Api
  class V2::Administration::ThreesixtyCampaignsController < Api::V2::Administration::BaseController
    validate_crud_requests Api::V2::ThreesixtyCampaign::Schema

    def create_campaign
      form = ::Threesixty::Campaigns::CreateForm.from_params(params[:data][:attributes])
      unless form.valid?
        return jsonapi_render_errors(form.errors, status: :unprocessable_entity)
      end

      if form.threesixty_type == Threesixty::Campaign::EMPTY
        @result = ::Threesixty::Campaigns::Create.call(project, form, current_user)
      else
        AdminJob.call(
          :create_threesixty_campaign,
          { project_id: project.id, data: params[:data][:attributes] },
          current_user
        )
      end

      render json: 'ok', status: :created
    end

    def policy_class
      ::Api::Administration::ThreesixtyCampaignPolicy
    end
  end
end
