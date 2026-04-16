# frozen_string_literal: true

module AdminJobs
  class RegenerateAssessmentTranscriptionsJob < AdminJobs::Base
    def self.validate(data, _owner)
      raise ArgumentError, 'campaign_id is required' if data[:campaign_id].blank?
      raise ArgumentError, 'campaign_assessment_id is required' if data[:campaign_assessment_id].blank?
    end

    def call
      media_response_ids = incomplete_transcription_media_response_ids

      if media_response_ids.empty?
        record.update!(total_tasks: 0)
        return broadcast :ok
      end

      record.update!(total_tasks: media_response_ids.count)

      media_response_ids.each do |media_response_id|
        MediaResponses::RegenerateTranscriptionJob.perform_later(
          media_response_id,
          record.id
        )
      end

      broadcast :waiting
    end

    def generate_title_link
      {
        href: build_campaign_url,
        label: "#{campaign&.name} - #{campaign_assessment&.assessment&.name}"
      }
    end

    def valid?
      campaign.present? && campaign_assessment.present?
    end

    private

    def campaign
      @campaign ||= Campaign.find_by(id: record.data['campaign_id'])
    end

    def campaign_assessment
      @campaign_assessment ||= CampaignAssessment.find_by(id: record.data['campaign_assessment_id'])
    end

    def incomplete_transcription_media_response_ids
      assessment = campaign_assessment.assessment

      transcription_enabled_question_ids = assessment.questions.
                                           where(type: %w[VideoResponse AudioResponse]).
                                           where("props ->> 'enableTranscription' = ?", 'true').
                                           pluck(:id)

      return [] if transcription_enabled_question_ids.empty?

      users_result_ids = campaign.user_assessments.
                         where(assessment_id: assessment.id).
                         where.not(users_result_id: nil).
                         pluck(:users_result_id)

      return [] if users_result_ids.empty?

      MediaResponse.
        joins(:transcription).
        where(users_result_id: users_result_ids).
        where(question_id: transcription_enabled_question_ids).
        where.not(transcriptions: { status: :completed }).
        pluck(:id)
    end
  end
end
