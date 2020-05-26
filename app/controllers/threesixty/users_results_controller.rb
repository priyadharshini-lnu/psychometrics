# frozen_string_literal: true

module Threesixty
  class UsersResultsController < ApplicationController
    # append_before_action :pundit_authorize
    skip_before_action :verify_authenticity_token, unless: -> { current_user.superadmin? }
    before_action :set_user_result, only: %i[update upload_media_url remove_media update_meta_data complete_multipart_upload]

    def update
      campaign = Threesixty::Campaign.find(params[:campaign_id])

      assign_params = ::UsersResults::ExtendResourceParams.call!(
        resource_params.to_h,
        params[:question_ids],
        @users_result
      )

      form = ::UsersResults::UpdatingForm.from_params(assign_params)
      ::UsersResults::UpdateUsersResult.call(form, @users_result, campaign)

      render json: { expired: @users_result.expired? }
    end

    def update_meta_data
      @users_result.update!(meta_data_params)
      head :no_content
    end

    def upload_media_url
      render json: MediaResponses::GetUploadUrl.call!(@users_result, params[:question_id])
    end

    def upload_callback
      media = MediaResponse.find(params[:media_id])
      media.asset_key = params[:asset_key]
      if media.save
        render json: media.reload.as_json.merge(filename: media.filename)
      else
        error_message = media.errors.messages.values.join(',')
        media.destroy
        render json: { error_message: error_message }, status: :unprocessable_entity
      end
    end

    def remove_media
      media = MediaResponse.find_by!(id: params[:media_id], users_result_id: @users_result.id)
      media.destroy
      if @users_result.answers&.dig(media.question_id.to_s)
        @users_result.answers[media.question_id.to_s]['answers'] = []
        @users_result.save
      end
      head :ok
    end

    def complete_multipart_upload
      media = @users_result.media_responses.find_by!(id: params[:media_id])
      MediaResponses::CompleteMultipartUpload.call!(media, params[:upload_id], params[:parts])

      render json: media.reload.as_json
    end

    def set_user_result
      @users_result = if current_user.superadmin?
                        UsersResult.find_by!(id: params[:id])
                      else
                        UsersResult.find_by!(id: params[:id], evaluator_id: current_user.id)
                      end
      authorize [:threesixty, @users_result]
    end

    private

    def resource_params
      params[:resource].permit(
        :current_element, :current_page, :status, :step, :norm_id, embedded_data: {}, answers: {}
      )
    end

    def meta_data_params
      params.permit(meta_data: {})
    end
  end
end
