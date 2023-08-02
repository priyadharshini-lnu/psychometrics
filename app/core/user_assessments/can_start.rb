# frozen_string_literal: true

module UserAssessments
  class CanStart < BaseCommand
    private_attr_reader :user_assessment, :current_user, :cookies

    def initialize(user_assessment, current_user, cookies)
      @user_assessment = user_assessment
      @current_user = current_user
      @cookies = cookies
    end

    def call
      return broadcast(:ok, true) if current_user.privacy_consent_required?
      return broadcast(:ok, true) if system_checks_required?

      broadcast :ok, false
    end

    def system_checks_required?
      extra = user_assessment.assessment.extra

      return true if extra['enable_audio_check'] == '1' && !cookies['checking_wizard.audio']
      return true if extra['enable_video_check'] == '1' && !cookies['checking_wizard.video']
      return true if extra['enable_network_check'] == '1' && !cookies['checking_wizard.network']

      false
    end
  end
end
