# frozen_string_literal: true

module Hogan
  class StartAssessment < BaseCommand
    private_attr_reader :user_assessment, :user, :credentials, :project, :hogan_group_name

    def initialize(user_assessment)
      @user_assessment = user_assessment
      @user = user_assessment.user
      @credentials = user.hogan_credential
      @project = user_assessment.project
      @hogan_group_name = project.hogan_group_name
    end

    def call
      return broadcast(:invalid) unless user_assessment.assessment.hogan?

      transaction do
        user_assessment.in_progress!
        create_group
        add_participant_to_group
        add_participant_assessment
      end

      broadcast(:ok)
    rescue StandardError => e
      Rails.logger.error(e)
      broadcast(:invalid)
    end

    private

    def create_group
      Services::Hogan::Api::Json::GroupDetails.call(group: hogan_group_name, provider: credentials&.provider) do
        on(:error) do
          Services::Hogan::Api::Json::CreateGroup.call!(group: hogan_group_name, provider: credentials&.provider)
        end
      end
    end

    def add_participant_to_group
      return if credentials.present?

      lock_key = "locks/hogan_credential/#{user.id}"
      lock_manager.lock!(lock_key, 2.minutes.in_milliseconds) do
        password = Devise.friendly_token.first(10)
        participant_id = Services::Hogan::Api::Json::AddParticipantToGroup.call!(
          group: hogan_group_name, password: password, provider: credentials&.provider
        )
        @credentials = HoganCredential.create!(
          password: password,
          participant_id: participant_id,
          user_id: user.id,
          provider: Rails.application.secrets.hogan[:default_provider]
        )
      end
    end

    def add_participant_assessment
      Services::Hogan::Api::Json::AddParticipantAssessment.call!(
        participant_id: credentials.participant_id,
        group: hogan_group_name,
        assessment_id: user_assessment.assessment.external_settings[:assessment_id],
        form_id: user_assessment.assessment.external_settings[:form_id],
        provider: credentials.provider
      )
    end

    def lock_manager
      @lock_manager ||= Redlock::Client.new([$redis]) # rubocop:disable Style/GlobalVars
    end
  end
end
