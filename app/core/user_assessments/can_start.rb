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
      return broadcast(:ok, true) if consent_required?
      return broadcast(:ok, true) if system_checks_required?

      broadcast :ok, false
    end

    def consent_required?
      if user_assessment.assessment.data_role_controller?
        user_assessment.data_controller_consent_required?(current_user)
      else
        current_user.privacy_consent_required?
      end
    end

    def system_checks_required?
      return false unless should_run_assessment_level_checks?

      return true if audio_check_required?
      return true if video_check_required?

      network_check_required?
    end

    private

    def should_run_assessment_level_checks?
      user_assessment.campaign.should_run_assessment_level_checks?
    end

    def audio_check_required?
      enable_audio_check? && !cookies['checking_wizard.audio']
    end

    def video_check_required?
      enable_video_check? && !video_check_cookie[user_assessment.id.to_s]
    end

    def network_check_required?
      assessment_extra['enable_network_check'] == true && !cookies['checking_wizard.network']
    end

    def enable_audio_check?
      assessment_extra['enable_audio_check'] || has_question_type?('AudioResponse')
    end

    def enable_video_check?
      assessment_extra['enable_video_check'] || has_question_type?('VideoResponse')
    end

    def assessment_extra
      user_assessment.assessment.extra
    end

    def video_check_cookie
      JSON.parse(cookies['checking_wizard.video'] || '{}')
    end

    def has_question_type?(type)
      available_questions = user_assessment.assessment.questions.not_deleted.uniq { |q| q[:type] }

      available_questions.any? { |q| q[:type] == type }
    end
  end
end
