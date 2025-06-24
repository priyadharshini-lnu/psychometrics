# frozen_string_literal: true

module Api
  class V2::Administration::Projects::IdpTemplatesController < Api::V2::Administration::BaseController
    before_action :set_user_idp_plan, only: %i[update destroy uploads]
    validate_crud_requests Api::V2::IdpTemplate::Schema
    validates_request_schema :create, :create_request_contract_and_schema
    validates_request_schema :update, :update_request_contract_and_schema

    def create_request_contract_and_schema
      Api::V2::IdpTemplate::Contract.new(
        schema: Api::V2::IdpTemplate::Schema.create_request
      )
    end

    def update_request_contract_and_schema
      Api::V2::IdpTemplate::Contract.new(
        schema: Api::V2::IdpTemplate::Schema.update_request
      )
    end

    def update
      return super if @user_idp_plan.blank?

      @model.update(appearance_params)

      render json: {
        error: t('administration.idp.errors.update')
      }, status: :bad_request
    end

    def update_reflection_questions
      IdpTemplates::UpdateReflectionQuestions.call(@model, params[:data][:attributes][:reflection_questions])

      jsonapi_render json: @model
    end

    def uploads
      if @model.update(uploads_params)
        jsonapi_render json: @model
      else
        render json: { errors: @model.errors }, status: :unprocessable_entity
      end
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

    def appearance_params
      params.required(:data).required(:attributes).permit(:title_text, :subtitle_text, :logo_type, :show_reflections,
                                                          fields: [], instructions: {}, translations: {})
    end

    def uploads_params
      params.permit(:background, :client_logo, :purge_background, :purge_client_logo)
    end
  end
end
