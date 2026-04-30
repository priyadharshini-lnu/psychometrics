# frozen_string_literal: true

module Api
  class V2::Administration::Projects::IdpTemplatesController < Api::V2::Administration::BaseController
    before_action :set_user_idp_plan, only: %i[update destroy uploads]
    validate_crud_requests Api::V2::IdpTemplate::Schema
    validates_request_schema :update, :update_request_contract_and_schema
    validates_request_schema :update_instructions, :update_instructions_request_contract_and_schema

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

    def update_instructions_request_contract_and_schema
      Api::V2::IdpTemplate::UpdateInstructionsContract.new(
        schema: Api::V2::IdpTemplate::Schema.update_instructions_request
      )
    end

    def show
      locale = params.dig(:query, :locale) || I18n.default_locale

      Mobility.with_locale(locale) do
        jsonapi_render json: @model
      end
    end

    def update
      if @user_idp_plan.present?
        render json: {
          error: t('administration.idp.errors.update')
        }, status: :bad_request
      else
        super
      end
    end

    def update_appearance
      if @model.update(appearance_params)
        audit! :update_appearance, @model, payload: appearance_params, project: project
        jsonapi_render json: @model
      else
        render json: { errors: @model.errors }, status: :unprocessable_entity
      end
    end

    def update_reflection_questions
      reflection_questions = params[:data][:attributes][:reflection_questions]
      IdpTemplates::UpdateReflectionQuestions.call(@model, reflection_questions)
      audit! :update_reflection_questions, @model,
             payload: { reflection_questions: reflection_questions },
             project: project

      jsonapi_render json: @model
    end

    def update_interview_questions
      IdpTemplates::UpdateInterviewQuestions.call(@model, params[:data][:attributes][:interview_questions])

      jsonapi_render json: @model
    end

    def update_instructions
      update_instructions_field(instructions: params[:data][:attributes][:instructions])
    end

    def update_chat_instructions
      update_instructions_field(chat_instructions: params[:data][:attributes][:chat_instructions])
    end

    def uploads
      if @model.update(uploads_params)
        audit! :uploads, @model, payload: uploads_params, project: project
        jsonapi_render json: @model
      else
        render json: { errors: @model.errors }, status: :unprocessable_entity
      end
    end

    def destroy
      if @user_idp_plan.blank?
        audit! :destroy, @model, payload: params, project: project
        super
        head :no_content
      else
        render json: {
          error: 'Deletion not allowed because the IDP template is already associated with a user IDP plan.'
        }, status: :bad_request
      end
    end

    def meta_details
      {
        permissions: lambda {
          GetPermissionsHash.call!(
            Api::Administration::IdpTemplatePolicy,
            context[:user],
            @model,
            %w[create],
            { project_id: params[:project_id] }
          )
        }
      }
    end

    private

    def update_instructions_field(instructions)
      locale = params[:data][:attributes][:locale] || I18n.default_locale

      Mobility.with_locale(locale) do
        @model.update!(instructions)
        audit! :update_instructions, @model, payload: instructions, project: project
        jsonapi_render json: @model
      end
    rescue StandardError
      render json: {
        error: t('administration.idp.errors.update')
      }, status: :bad_request
    end

    def set_user_idp_plan
      @user_idp_plan = UserIdpPlan.find_by(idp_template_id: params[:id])
    end

    def appearance_params
      params.required(:data).required(:attributes).permit(:title_text, :subtitle_text, :logo_type,
                                                          :show_reflections, :show_reflection_questions,
                                                          :show_guidelines, :guideline_position, :flip_background,
                                                          fields: [], translations: {}, page_styles: {})
    end

    def uploads_params
      params.permit(:background, :client_logo, :purge_background, :purge_client_logo)
    end
  end
end
