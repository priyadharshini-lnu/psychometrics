# frozen_string_literal: true

module Hogan
  class StartAssessment < AsyncResponseRequest::AsyncRequestHandler
    def call
      unless user_assessment.assessment.hogan?
        return broadcast(:invalid, async_response)
      end

      transaction do
        user_assessment.in_progress!
        create_group
        add_participant_to_group
        add_participant_assessment
      end

      async_response.response_data = serialized_hogan_credential(credentials)
      broadcast(:ok, async_response)
    rescue StandardError => e
      Rails.logger.error(e)
      broadcast(:invalid, async_response)
    end

    private

    def create_group
      Services::Hogan::Api::Json::GroupDetails.call(group: hogan_group_name, provider: hogan_provider) do
        on(:error) do
          Services::Hogan::Api::Json::CreateGroup.call!(group: hogan_group_name, provider: hogan_provider)
        end
      end
    end

    def add_participant_to_group
      if credentials.present?
        async_response.response_data = serialized_hogan_credential(credentials)
        return broadcast(:ok, async_response)
      end

      lock_key = "locks/hogan_credential/#{current_user.id}"
      lock_manager.lock!(lock_key, 2.minutes.in_milliseconds) do
        password = Devise.friendly_token.first(10)
        participant_id = Services::Hogan::Api::Json::AddParticipantToGroup.call!(
          group: hogan_group_name, password: password, provider: hogan_provider
        )

        @credentials = HoganCredential.create!(
          password: password,
          participant_id: participant_id,
          user_id: current_user.id,
          provider: project.hogan_provider,
          norm: HoganCredential::DEFAULT_NORM
        )
      end
    end

    def add_participant_assessment
      Services::Hogan::Api::Json::AddParticipantAssessment.call!(
        participant_id: credentials.participant_id,
        group: hogan_group_name,
        assessment_id: user_assessment.assessment.external_settings[:assessment_id],
        form_id: user_assessment.assessment.external_settings[:form_id],
        provider: hogan_provider
      )
    end

    def lock_manager
      @lock_manager ||= Redlock::Client.new([$redis]) # rubocop:disable Style/GlobalVars
    end

    def user_assessment
      @user_assessment ||= UserAssessment.find_by!(id: params[:id], evaluator_id: current_user.id)
    end

    def credentials
      @credentials ||= current_user.hogan_credential
    end

    def project
      @project ||= user_assessment.project
    end

    def hogan_group_name
      @hogan_group_name ||= project.hogan_group_name
    end

    def async_response
      @async_response ||= AsyncResponseRequest::AsyncResponse.new(
        processing_status: :completed,
        response_type: :json,
        response_data: nil
      )
    end

    def serialized_hogan_credential(hogan_credential)
      ::HoganCredentialSerializer.new(context: {
        hogan_credential: hogan_credential, include: '**'
      }).serialize(user_assessment)
    end

    def hogan_provider
      credentials&.provider || project.hogan_provider
    end
  end
end
