# frozen_string_literal: true

module UsersResults
  class GetMediaUploadUrl < BaseCommand
    def initialize(users_result, question_id)
      @question_id = question_id
      @users_result = users_result
    end

    def call
      media = MediaResponse.find_or_create_by(
        question_id: question_id,
        users_result_id: users_result.id
      )

      data = if Rails.env.production?
               uploader = media.asset

               uploader.success_action_status = '200'
               {
                 media_id: media.id,
                 env: 'prod',
                 url: uploader.direct_fog_url,
                 key: uploader.key,
                 acl: uploader.acl,
                 policy: uploader.policy,
                 success_action_status: uploader.success_action_status,
                 'x-amz-algorithm': uploader.algorithm,
                 "x-amz-credential": uploader.credential,
                 "x-amz-date": uploader.date,
                 "x-amz-signature": uploader.signature
               }
             else
               {
                 media_id: media.id,
                 env: 'dev',
                 url: Rails.application.routes.
                   url_helpers.
                   upload_media_dev_campaign_users_result_path(users_result.campaign.id, users_result.id)
               }
      end

      broadcast(:ok, data)
    end

    private

    attr_reader :question_id, :users_result
  end
end
