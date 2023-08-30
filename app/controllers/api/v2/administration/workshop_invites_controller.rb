# frozen_string_literal: true

module Api
  class V2::Administration::WorkshopInvitesController < Api::V2::Administration::BaseController
    validate_crud_requests Api::V2::WorkshopInvite::Schema
    validates_request_schema :create, Api::V2::WorkshopInvite::CreateContract.new
    validates_request_schema :create_relationship, Api::V2::WorkshopInvite::CreateRelationshipsContract.new

    prepend_before_action :set_workshops, only: %i[create]

    def create
      ActiveRecord::Base.transaction do
        campaign = Api::Administration::CampaignPolicy::Scope.new(
          current_user,
          Campaign
        ).resolve.find(params.dig(:filter, :workshops_campaign_id_eq))

        @workshop_invite = campaign.workshop_invites.create!(workshop_invite_params)
        @workshops.each do |workshop|
          @workshop_invite.workshops << workshop
        end
        WorkshopInvites::CreateTranslations.call!(@workshop_invite, translations_params[:translations])
        AdminJob.call(:bulk_create_workshop_invites,
                      { workshop_invite_id: @workshop_invite.id, subjects: subjects_params[:subjects] }, current_user)
      end

      jsonapi_render json: @workshop_invite
    end

    def import_subjects_from_csv
      users, @errors = WorkshopInvites::ImportSubjects.call!(params[:campaign_id], params[:file])

      jsonapi_render json: users.to_a, options: { resource: Api::V2::Administration::UserResource }
    end

    def import_subjects_from_campaign
      users = User.with_campaign_user(params[:filter][:campaign_id]).includes(:user_profile)
      if users.count <= ::WorkshopInvite::RESTRICTED_SUBJECTS
        jsonapi_render json: users.to_a, options: { resource: Api::V2::Administration::UserResource }
      else
        jsonapi_render_errors [{
          title: I18n.t('administration.assessment_center.invite.exceeded_subjects_count',
                        users: users.count, count: ::WorkshopInvite::RESTRICTED_SUBJECTS)
        }], status: :unprocessable_entity
      end
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
