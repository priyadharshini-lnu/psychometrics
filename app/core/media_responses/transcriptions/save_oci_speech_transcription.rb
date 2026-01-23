# frozen_string_literal: true

module MediaResponses
  module Transcriptions
    class SaveOciSpeechTranscription < BaseCommand
      private_attr_reader :media_response, :job_id

      def initialize(media_response, job_id)
        @media_response = media_response
        @job_id = job_id
      end

      def call
        broadcast :ok, save_transcription
      end

      private

      def save_transcription
        s3key = get_transcription_s3key
        transcription_text = extract_transcription_text(s3key)

        if media_response.transcription.present?
          media_response.transcription.update!(text: transcription_text)
        else
          media_response.create_transcription!(text: transcription_text)
        end

        media_response.update!(transcription_status: :completed)
      end

      def s3_client
        @s3_client ||= Aws::S3::Client.new(
          access_key_id: Settings.secrets.s3_compatible_storage[:access_key_id],
          secret_access_key: Settings.secrets.s3_compatible_storage[:secret_access_key],
          region: Settings.secrets.s3_compatible_storage[:region]
        )
      end

      def extract_transcription_text(s3key)
        bucket = Settings.secrets.s3_compatible_storage[:private_bucket]

        response = s3_client.get_object(bucket: bucket, key: s3key)
        json_data = JSON.parse(response.body.read)

        # Extract from OCI format: transcriptions[0].transcription
        if json_data['transcriptions'].is_a?(Array) && json_data['transcriptions'].first
          json_data['transcriptions'].first['transcription']
        else
          raise "Invalid transcription format: #{json_data.inspect}"
        end
      end

      def get_transcription_s3key
        speech_client = OCI::AiSpeech::AIServiceSpeechClient.new(config: Psy::Oci.config)

        tasks_response = speech_client.list_transcription_tasks(job_id)
        tasks = tasks_response.data.items
        task_id = tasks.first.id
        task_details = speech_client.get_transcription_task(job_id, task_id).data
        task_details.output_location.object_names.first
      end
    end
  end
end
