# frozen_string_literal: true

module UserAssessmentVerificationImages
  class GetImageUploadUrl < BaseCommand
    private_attr_reader :user_assessment, :blob_params

    def initialize(user_assessment, blob_params)
      @user_assessment = user_assessment
      @blob_params = blob_params
    end

    def call
      media = user_assessment.user_assessment_verification_images.create

      result = ObjectStorage::GetSingleSignedUploadUrl.call!(
        model: media, field: :file, blob_params: blob_params, file_name: "#{SecureRandom.uuid}_image.jpeg"
      )

      broadcast :ok, result
    rescue StandardError => e
      broadcast(:error, e)
    end
  end
end
