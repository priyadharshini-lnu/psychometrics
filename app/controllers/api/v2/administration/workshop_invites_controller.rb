# frozen_string_literal: true

module Api
  class V2::Administration::WorkshopInvitesController < Api::V2::Administration::BaseController
    validate_crud_requests Api::V2::WorkshopInvite::Schema
    validates_request_schema :create_subjects_and_translations,
                             Api::V2::WorkshopInvite::Schema.create_subjects_and_translations

    prepend_before_action :set_workshop, only: %i[create]
    prepend_before_action :set_resource, only: %i[create_subjects_and_translations]

    def create_subjects_and_translations
      ActiveRecord::Base.transaction do
        WorkshopInvites::BulkCreateSubjects.call!(@workshop_invite, subjects_params[:subjects])
        WorkshopInvites::CreateTranslations.call!(@workshop_invite, subjects_params[:translations])
      end
      render json: {}
    end

    def import_subjects_from_csv
      users, @errors = WorkshopInvites::ImportSubjects.call!(params[:campaign_id], params[:file])

      jsonapi_render json: users.to_a, options: { resource: Api::V2::Administration::UserResource }
    end

    def import_subjects_from_campaign
      users = User.with_campaign_user(params[:filter][:campaign_id])
      jsonapi_render json: users.to_a, options: { resource: Api::V2::Administration::UserResource }
    end

    def set_workshop
      @workshop = Api::Administration::WorkshopPolicy::Scope.new(
        current_user, Workshop
      ).resolve.find_by(campaign_id: params[:filter][:workshops_campaign_id_eq])
    end

    def set_resource
      @workshop_invite = Api::Administration::WorkshopInvitePolicy::Scope.new(
        current_user, WorkshopInvite
      ).resolve.find(params[:workshop_invite_id])
    end

    def subjects_params
      params.require(:data).require(:attributes).permit(subjects: [:user_id],
                                                        translations: %i[locale title description])
    end

    def base_response_meta
      return { errors: @errors } if @errors&.any?

      {}
    end
  end
end
