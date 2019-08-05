module Threesixty
  class UsersResultsController < ApplicationController
    #append_before_action :pundit_authorize
    # skip_before_action :verify_authenticity_token

    def update
      campaign = Threesixty::Campaign.find(params[:campaign_id])
      users_result = UsersResult.find_by!(id: params[:id], evaluator_id: current_user.id)
      form = ::UsersResults::UpdatingForm.from_params(params.require(:resource))
      ::UsersResults::UpdateUsersResult.call(form, users_result, campaign)

      head :no_content
    end

    def upload_media_dev
      media = MediaResponse.find(params[:media_id])
      media.update_attributes(asset: params[:asset])
      render json: media
    end

    def upload_media_url
      users_result = UsersResult.find_by!(id: params[:id], evaluator_id: current_user.id)

      data = if true # Rails.env.production?
        @media = MediaResponse.create(
          question_id: params[:question_id],
          users_result_id: users_result.id,
        )
        @uploader = @media.asset

        @uploader.success_action_redirect = '/' # unused but need for work
        {
          media_id: @media.id,
          env: 'prod',
          url: @uploader.direct_fog_url,
          key: @uploader.key,
          acl: @uploader.acl,
          policy: @uploader.policy,
          success_action_redirect: @uploader.success_action_redirect,
          'x-amz-algorithm': @uploader.algorithm,
          "x-amz-credential": @uploader.credential,
          "x-amz-date": @uploader.date,
          "x-amz-signature": @uploader.signature
        }
      else
        {env: 'dev', url: upload_media_dev_campaign_users_result_path}
      end
      render json: data
    end

    def upload_callback
      media = MediaResponse.find(params[:media_id])
      media.update_attributes(asset_key: params[:asset_key])
      media.reload # get data after fetching from s3
      render json: media
    end
  end
end
