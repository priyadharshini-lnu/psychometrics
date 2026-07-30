# frozen_string_literal: true

module Api
  class V2::Administration::ThreesixtyCampaignsController < Api::V2::Administration::BaseController
    validate_crud_requests Api::V2::ThreesixtyCampaign::Schema
    validates_request_schema :create_campaign, -> { Api::V2::ThreesixtyCampaign::Schema.create_campaign }

    before_action :find_campaign, only: %i[copy_as_template convert_to_template]

    def create_campaign
      form = ::Threesixty::Campaigns::CreateForm.from_params(params[:data][:attributes])
      unless form.valid?
        return jsonapi_render_errors(form.errors, status: :unprocessable_entity)
      end

      if form.threesixty_type == Threesixty::Campaign::EMPTY
        result = ::Threesixty::Campaigns::Create.call(project, form, current_user)
        if result[:ok]
          render json: ::Administration::Campaigns::CampaignSerializer.new({ context: { current_user: current_user } }).
            serialize(result[:ok].campaign)
        else
          jsonapi_render_errors [{ code: result[:error] }], status: :unprocessable_entity
        end
      else
        AdminJob.call(
          :create_threesixty_campaign,
          { project_id: project.id, data: params[:data][:attributes] },
          current_user
        )
        render json: :ok
      end
    end

    def copy_as_template
      new_name = params.dig(:data, :attributes, :name)
      owner_id = params.dig(:data, :relationships, :owner, :data, :id)
      audit! :copy_as_template, @campaign, campaign: @campaign, user: current_user,
        payload: { source_id: @campaign.id, new_name: new_name,
                   owner_id: owner_id }
      AdminJob.call(
        :copy_as_template_or_campaign,
        { campaign_id: params[:id], is_template: true },
        current_user
      )
      render json: :ok
    end

    def convert_to_template
      result = ::Threesixty::Campaigns::ConvertToTemplate.call(@campaign)
      if result[:ok]
        audit! :convert_to_template, @campaign, campaign: @campaign, user: current_user

        render json: ::Administration::Campaigns::CampaignSerializer.new({ context: { current_user: current_user } }).
          serialize(result[:ok][:campaign])
      else
        render json: { error: result[:error] }, status: :unprocessable_entity
      end
    end

    private

    def find_campaign
      @campaign = Campaign.find(params[:id])
    end

    def policy_class
      ::Api::Administration::ThreesixtyCampaignPolicy
    end
  end
end
