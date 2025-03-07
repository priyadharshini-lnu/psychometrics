# frozen_string_literal: true

module Hogan
  class StartAssessment < AsyncResponseRequest::AsyncRequestHandler
    def call
      unless user_assessment.assessment.hogan?
        return broadcast(:invalid, async_response)
      end

      transaction do
        user_assessment.in_progress!
        add_hogan_participant
        add_participant_assessment
      end

      async_response.response_data = serialized_hogan_credential(user_assessment_hogan_credential)
      broadcast(:ok, async_response)
    rescue StandardError => e
      Rails.logger.error(e)
      broadcast(:invalid, async_response)
    end

    private

    def add_hogan_participant
      ::Hogan::CreateHoganParticipant.call!(current_user) if user_hogan_credential.nil?

      create_resource_hogan_credential
    end

    def add_participant_assessment
      Services::Hogan::Api::Json::AddParticipantAssessment.call!(
        participant_id: user_assessment_hogan_credential.participant_id,
        group: user_assessment_hogan_credential.hogan_group_name,
        assessment_id: user_assessment.assessment.external_settings[:assessment_id],
        form_id: user_assessment.assessment.external_settings[:form_id],
        provider: hogan_provider
      )
    end

    def create_resource_hogan_credential
      user_assessment.attach_hogan_credential(user_hogan_credential)

      user_reports.each do |user_report|
        user_report.attach_hogan_credential(user_hogan_credential)
      end
    end

    def user_assessment
      @user_assessment ||= UserAssessment.find_by!(id: params[:id], evaluator_id: current_user.id)
    end

    def user_reports
      current_user.
        user_reports.
        for_assessment(user_assessment.assessment_id).
        where(campaign_id: user_assessment.campaign_id)
    end

    def user_hogan_credential
      current_user.reload.hogan_credential
    end

    def user_assessment_hogan_credential
      user_assessment.reload.hogan_credential
    end

    def project
      @project ||= user_assessment.project
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
      user_hogan_credential&.provider || project.hogan_provider
    end
  end
end
