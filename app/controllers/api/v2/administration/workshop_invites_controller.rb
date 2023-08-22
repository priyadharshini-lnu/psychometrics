# frozen_string_literal: true

module Api
  class V2::Administration::WorkshopInvitesController < Api::V2::Administration::BaseController
    validate_crud_requests Api::V2::WorkshopInvite::Schema
    prepend_before_action :set_workshops, only: %i[create]

    def create
      ActiveRecord::Base.transaction do
        @workshop_invite = WorkshopInvite.create!(workshop_invite_params)
        @workshops.each do |workshop|
          @workshop_invite.workshops << workshop
        end
        WorkshopInvites::BulkCreateSubjects.call!(@workshop_invite, subjects_params[:subjects])
        WorkshopInvites::CreateTranslations.call!(@workshop_invite, translations_params[:translations])
      end

      jsonapi_render json: @workshop_invite
    end

    def import_subjects_from_csv
      users, @errors = WorkshopInvites::ImportSubjects.call!(params[:campaign_id], params[:file])

      jsonapi_render json: users.to_a, options: { resource: Api::V2::Administration::UserResource }
    end

    def import_subjects_from_campaign
      users = User.with_campaign_user(params[:filter][:campaign_id])
      jsonapi_render json: users.to_a, options: { resource: Api::V2::Administration::UserResource }
    end

    def set_workshops
      @workshops = Api::Administration::WorkshopPolicy::Scope.new(
        current_user, Workshop
      ).resolve.where(id: workshop_params[:workshop_ids])
    end

    def set_resource
      @workshop_invite = Api::Administration::WorkshopInvitePolicy::Scope.new(
        current_user, WorkshopInvite
      ).resolve.find(params[:workshop_invite_id])
    end

    def workshop_params
      params.require(:data).require(:attributes).permit(workshop_ids: [])
    end

    def workshop_invite_params
      params.require(:data).require(:attributes).permit(:campaign_id, :allow_language_preference,
                                                        :allow_neurodiversity_option, allowed_languages: [])
    end

    def subjects_params
      params.require(:data).require(:attributes).permit(subjects: [:user_id])
    end

    def translations_params
      params.require(:data).require(:attributes).permit(translations: %i[locale title description])
    end

    def base_response_meta
      return { errors: @errors } if @errors&.any?

      {}
    end
  end
end
