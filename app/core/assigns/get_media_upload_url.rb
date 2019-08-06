# frozen_string_literal: true

module Assigns
  class GetMediaUploadUrl < BaseCommand
    def initialize(assign, question_id)
      @question_id = question_id
      @assign = assign
    end

    def call
      media = MediaResponse.create(
        question_id: question_id,
        assign_id: assign.id,
      )

      data = if Rails.env.production?
        uploader = media.asset

        uploader.success_action_redirect = '/' # unused but need for work
        {
          media_id: @media.id,
          env: 'prod',
          url: uploader.direct_fog_url,
          key: uploader.key,
          acl: uploader.acl,
          policy: uploader.policy,
          success_action_redirect: uploader.success_action_redirect,
          'x-amz-algorithm': uploader.algorithm,
          "x-amz-credential": uploader.credential,
          "x-amz-date": uploader.date,
          "x-amz-signature": uploader.signature
        }
      else
        {
          media_id: media.id,
          env: 'dev',
          url: Rails.application.routes.url_helpers.upload_media_dev_assign_path(assign.id)
        }
      end

      broadcast(:ok, data)
    end

    private

    attr_reader :question_id, :assign

  end
end
