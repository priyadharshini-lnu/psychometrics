# frozen_string_literal: true

module SystemCheckSessions
  class GetSystemCheckStatus < BaseCommand
    SATISFIED = :satisfied
    UNSATISFIED = :unsatisfied
    NOT_REQUIRED = :not_required

    private_attr_reader :session, :campaign_user, :requirements

    def initialize(session_id:, campaign_user:, skip_validity_check: false)
      @campaign_user = campaign_user
      @session = find_session(session_id, skip_validity_check)
      @requirements = RequirementsCalculator.call!(campaign_user)
    end

    def call
      status = compute_status
      is_valid = compute_is_valid(status)
      broadcast :ok, { session_id: session&.id, requirements: requirements, is_valid: is_valid }
    end

    def satisfied?
      all_satisfied?(compute_status)
    end

    private

    def find_session(session_id, skip_validity_check)
      return nil if session_id.blank?

      system_check_session = SystemCheckSession.find_by(id: session_id, user: campaign_user.user)
      return system_check_session if skip_validity_check && system_check_session&.completed?
      return nil unless system_check_session&.valid_for_campaign?(campaign)

      system_check_session
    end

    def compute_is_valid(status)
      return false unless session

      all_satisfied?(status) || campaign.allow_continue_with_warning?
    end

    def campaign
      @campaign ||= campaign_user.campaign
    end

    def compute_status
      return nil unless session

      {
        browser: browser_check_status,
        network: network_check_status,
        video: video_check_status,
        audio: audio_check_status
      }
    end

    def browser_check_status
      return NOT_REQUIRED unless requirements[:browser][:required]

      browser_record = latest_records['browser']
      return UNSATISFIED unless browser_record&.passed?

      SATISFIED
    end

    def network_check_status
      return NOT_REQUIRED unless requirements[:network][:required]

      network_record = latest_records['network']
      return UNSATISFIED unless network_record

      meets_requirements = network_record.meets_network_requirements?(
        minimum_download_speed: requirements[:network][:minimum_download_speed],
        minimum_upload_speed: requirements[:network][:minimum_upload_speed]
      )

      meets_requirements ? SATISFIED : UNSATISFIED
    end

    def video_check_status
      return NOT_REQUIRED unless requirements[:video][:required]

      video_record = latest_records['video']
      return UNSATISFIED unless video_record&.passed?

      return UNSATISFIED if campaign.face_detection_enabled? &&
                            !video_record.meets_face_detection_requirements?(
                              minimum_ratio: campaign.minimum_face_detection_ratio / 100.0
                            )
      return UNSATISFIED if campaign.phrase_verification_enabled? &&
                            !video_record.data&.dig('phrase_matched')

      SATISFIED
    end

    def audio_check_status
      return NOT_REQUIRED unless requirements[:audio][:required]
      return SATISFIED if video_record_passed?

      audio_record = latest_records['audio']
      return UNSATISFIED unless audio_record&.passed?

      return UNSATISFIED if campaign.phrase_verification_enabled? &&
                            !audio_record.data&.dig('phrase_matched')

      SATISFIED
    end

    def video_record_passed?
      latest_records['video']&.passed?
    end

    def latest_records
      @latest_records ||= session.latest_records_by_check_type
    end

    public

    def all_satisfied?(status)
      status&.none? { |_check, result| result == :unsatisfied } || false
    end
  end
end
