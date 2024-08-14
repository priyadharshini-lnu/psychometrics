# frozen_string_literal: true

module UserAssessmentVerificationImages
  class GetImageUploadUrl < BaseCommand
    private_attr_reader :user_assessment

    def initialize(user_assessment)
      @user_assessment = user_assessment
    end

    def call
      media = user_assessment.user_assessment_verification_images.create
      result = ObjectStorage::GetSingleSignedUploadUrl.call!(media, :file, 'image.jpeg')

      broadcast :ok, result
    rescue StandardError => e
      broadcast(:error, e)
    end
  end
end
