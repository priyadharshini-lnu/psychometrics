# frozen_string_literal: true

module SystemCheckSessions
  class GetSystemCheckStatus < BaseCommand
    SATISFIED = :satisfied
    UNSATISFIED = :unsatisfied
    NOT_REQUIRED = :not_required

    private_attr_reader :session, :requirements

    def initialize(session:, requirements:)
      @session = session
      @requirements = requirements
    end

    def call
      return broadcast :ok, nil unless session

      results = {
        browser: get_browser_check_status,
        network: get_network_check_status,
        video: get_video_check_status
      }

      broadcast :ok, results
    end

    private

    def get_browser_check_status
      return NOT_REQUIRED unless requirements[:browser][:required]

      browser_record = latest_records['browser']
      return UNSATISFIED unless browser_record&.passed?

      SATISFIED
    end

    def get_network_check_status
      return NOT_REQUIRED unless requirements[:network][:required]

      network_record = latest_records['network']
      return UNSATISFIED unless network_record

      meets_requirements = network_record.meets_network_requirements?(
        minimum_download_speed: requirements[:network][:minimum_download_speed],
        minimum_upload_speed: requirements[:network][:minimum_upload_speed]
      )

      meets_requirements ? SATISFIED : UNSATISFIED
    end

    def get_video_check_status
      return NOT_REQUIRED unless requirements[:video][:required]

      video_record = latest_records['video']
      return UNSATISFIED unless video_record&.passed?

      SATISFIED
    end

    def latest_records
      @latest_records ||= session.latest_records_by_check_type
    end
  end
end
