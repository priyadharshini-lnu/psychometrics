# frozen_string_literal: true

module UserAssessmentVerificationMedia
  class GetMediaUploadUrl < BaseCommand
    private_attr_reader :user_assessment, :blob_params, :media_type

    def initialize(user_assessment, blob_params, media_type = :video)
      @user_assessment = user_assessment
      @blob_params = blob_params
      @media_type = media_type.to_sym
    end

    def call
      media = user_assessment.user_assessment_verification_media.create(media_type: media_type)

      result = ObjectStorage::GetSingleSignedUploadUrl.call!(
        model: media,
        field: :file,
        blob_params: blob_params,
        file_name: generate_media_filename
      )

      broadcast :ok, result
    rescue StandardError => e
      broadcast(:error, e)
    end

    private

    def generate_media_filename
      content_type = blob_params[:content_type].to_s
      extension = content_type.split('/').last

      case media_type
        when :audio
          "#{SecureRandom.uuid}_audio.#{extension.presence || 'mp3'}"
        else
          "#{SecureRandom.uuid}_video.#{extension.presence || 'mp4'}"
      end
    end
  end
end
