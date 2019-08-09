module Threesixty
  class UsersResultsController < ApplicationController
    # append_before_action :pundit_authorize
    skip_before_action :verify_authenticity_token
    before_action :set_user_result, only: [:update, :upload_media_url, :remove_media]

    def update
      campaign = Threesixty::Campaign.find(params[:campaign_id])
      form = ::UsersResults::UpdatingForm.from_params(params.require(:resource))
      ::UsersResults::UpdateUsersResult.call(form, @users_result, campaign)

      head :no_content
    end

    def upload_media_url
      render json: UsersResults::GetMediaUploadUrl.call!(@users_result, params[:question_id])
    end

    def upload_media_dev
      return head :no_content if Rails.env.production?

      media = MediaResponse.find(params[:media_id])
      media.update_attributes(asset: params[:asset])
      render json: media
    end

    def upload_callback
      media = MediaResponse.find(params[:media_id])
      media.update_attributes(asset_key: params[:asset_key])
      media.reload # get data after fetching from s3
      render json: media
    end

    def remove_media
      media = MediaResponse.find_by!(id: params[:media_id], users_result_id: @users_result.id)
      media.destroy
      if @users_result.answers[media.question_id.to_s]
        @users_result.answers[media.question_id.to_s]['answers'] = []
        @users_result.save
      end
      head :ok
    end

    def set_user_result
      @users_result = UsersResult.find_by!(id: params[:id], evaluator_id: current_user.id)
    end
  end
end
