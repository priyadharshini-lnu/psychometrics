# frozen_string_literal: true

module MediaResponses
  class CreateFromMediaUrl < BaseCommand
    private_attr_reader :url, :user_result, :question, :transcription_text, :user_selected

    def initialize(url:, user_result:, question:, transcription_text: nil, user_selected: true)
      @url = url
      @user_result = user_result
      @question = question
      @transcription_text = transcription_text
      @user_selected = user_selected
    end

    def call
      return broadcast(:error, 'URL is blank') if url.blank?
      return broadcast(:error, 'User result is blank') if user_result.blank?
      return broadcast(:error, 'Question is blank') if question.blank?

      media_response = create_media_response_from_url
      return broadcast(:error, 'Failed to create media response') unless media_response

      broadcast :ok, media_response
    rescue StandardError => e
      Rails.logger.error("CreateFromMediaUrl failed: #{e.message}")
      broadcast :error, e.message
    end

    private

    def create_media_response_from_url
      downloaded_file = download_file_from_url
      return nil unless downloaded_file

      media_response = build_media_response
      attach_file_to_media_response(media_response, downloaded_file)
      build_transcription(media_response) if transcription_text.present?

      media_response.save!
      enqueue_transcription_if_needed(media_response)
      media_response
    end

    def enqueue_transcription_if_needed(media_response)
      return if media_response.transcription&.text.present?

      MediaResponses::AddTranscriptionJob.perform_later(media_response.id)
    end

    def build_media_response
      MediaResponse.new(
        users_result: user_result,
        question: question,
        user_selected: user_selected
      )
    end

    def attach_file_to_media_response(media_response, downloaded_file)
      media_response.asset.attach(
        io: downloaded_file,
        filename: extract_filename_from_url,
        content_type: detect_content_type
      )
    end

    def download_file_from_url
      uri = URI.parse(url)
      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = uri.scheme == 'https'
      http.open_timeout = 30
      http.read_timeout = 60

      request = Net::HTTP::Get.new(uri)
      response = http.request(request)

      if response.is_a?(Net::HTTPSuccess)
        StringIO.new(response.body)
      else
        Rails.logger.error("Failed to download file from URL: #{url}, status: #{response.code}")
        nil
      end
    rescue StandardError => e
      Rails.logger.error("Error downloading file from URL: #{url}, error: #{e.message}")
      nil
    end

    def extract_filename_from_url
      uri = URI.parse(url)
      path = uri.path
      filename = File.basename(path)
      filename.presence || "media_#{SecureRandom.hex(8)}.webm"
    end

    def detect_content_type
      extension = File.extname(extract_filename_from_url).downcase.delete('.')
      content_types = {
        'mp4' => 'video/mp4',
        'webm' => 'video/webm',
        'mov' => 'video/quicktime',
        'mp3' => 'audio/mpeg',
        'wav' => 'audio/wav',
        'ogg' => 'audio/ogg'
      }
      content_types[extension] || 'application/octet-stream'
    end

    def build_transcription(media_response)
      media_response.build_transcription(
        text: transcription_text,
        status: :completed
      )
    end
  end
end
