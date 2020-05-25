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

      data = if Rails.env.production? || true

               uploader = media.asset
               data = []
               urls = []
               uploader.success_action_status = '200'
               signer = Aws::S3::Presigner.new

               multipartRequest = Aws::S3::Client.new.create_multipart_upload(
                 bucket: Rails.application.secrets.directory, key: "samplevid.mp4" #, acl: uploader.acl
               )
              # byebug
               4.times do |time|
                 part_number = "#{time + 1}"
                #  policy = uploader.policy do |conditons|
                #   conditons << { 'uploadId' => multipartRequest.upload_id }
                #   conditons << { 'partNumber' => part_number }
                #  end

                #  data <<  {
                #   media_id: media.id,
                #   env: 'prod',
                #   # url: uploader.direct_fog_url,
                #   key: uploader.key,
                #   acl: uploader.acl,
                #   # policy: policy,
                #   partNumber: part_number,
                #   uploadId: multipartRequest.upload_id,
                #   # success_action_status: uploader.success_action_status,
                #   'X-AMZ-ALGORITHM': uploader.algorithm,
                #   "X-AMZ-CREDENTIAL": uploader.credential,
                #   "X-AMZ-DATE": uploader.date,
                #   "X-AMZ-SIGNATURE": uploader.signature,
                #   "X-Amz-SignedHeaders": 'host'
                # }
                urls << signer.presigned_url(:upload_part, bucket: Rails.application.secrets.directory, key: "samplevid.mp4",
                  upload_id: multipartRequest.upload_id, part_number: part_number)
                uploader.clear_policy!
               end
               data
             else
               {
                 media_id: media.id,
                 env: 'dev',
                 url: Rails.application.routes.
                   url_helpers.
                   upload_media_dev_campaign_users_result_path(users_result.campaign.id, users_result.id)
               }
             end

      # broadcast(:ok, {
      #            media_id: media.id,
      #            env: 'prod',
      #            url: uploader.direct_fog_url,
      #            key: uploader.key,
      #            acl: uploader.acl,
      #            policy: uploader.policy,
      #            success_action_status: uploader.success_action_status,
      #            'x-amz-algorithm': uploader.algorithm,
      #            "x-amz-credential": uploader.credential,
      #            "x-amz-date": uploader.date,
      #            "x-amz-signature": uploader.signature
      #          })
      broadcast(:ok, urls)
    end

    private

    attr_reader :question_id, :users_result
  end
end


# s3.complete_multipart_upload({
#   bucket: Rails.application.secrets.directory,
#   key: "samplevideo.mp4",
#   multipart_upload: {
#     parts: [
#       {
#         etag: "\"bd6022cec4318ca6eacfad000b8620b4\"",
#         part_number: 1,
#       },
#       {
#         etag: "\"306996007439c69a88f8ac83cf8c9a9d\"",
#         part_number: 2,
#       },
#     ],
#   },
#   upload_id: "qo3Qb604n97mamooa42Xz6MnRgTV_JadBZC65GFyRkiw2TU4RVZI6V.MxPVJNCJ6ie3iOE2zgpLcmEmw96oApQ--",
# })
