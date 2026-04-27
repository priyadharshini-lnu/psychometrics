# frozen_string_literal: true

module MediaResponses
  module Transcriptions
    class SaveOciSpeechTranscription < BaseCommand
      private_attr_reader :media_response, :job_id, :media_response_id, :admin_job_record_id

      HALLUCINATION_THRESHOLDS = {
        min_overall_confidence: 0.4
      }.freeze

      def initialize(options)
        @job_id = options[:job_id]
        @media_response_id = options[:record_id]
        @admin_job_record_id = options[:admin_job_record_id]
      end

      def call
        return unless media_response

        broadcast :ok, save_transcription
      end

      private

      def media_response
        @media_response ||= MediaResponse.find_by(id: media_response_id)
      end

      def save_transcription
        s3key = get_transcription_s3key
        transcription_data = extract_transcription_data(s3key)

        media_response.save_transcription_completed!(
          transcription_data[:text],
          segments: transcription_data[:segments],
          metadata: transcription_data[:metadata]
        )

        update_admin_job_progress
      end

      def s3_client
        @s3_client ||= Aws::S3::Client.new(
          access_key_id: Settings.secrets.s3_compatible_storage[:access_key_id],
          secret_access_key: Settings.secrets.s3_compatible_storage[:secret_access_key],
          region: Settings.secrets.s3_compatible_storage[:region]
        )
      end

      def extract_transcription_data(s3key)
        bucket = Settings.secrets.s3_compatible_storage[:private_bucket]

        response = s3_client.get_object(bucket: bucket, key: s3key)
        json_data = JSON.parse(response.body.read)

        transcriptions = json_data['transcriptions']
        transcription_entry = transcriptions.is_a?(Array) ? transcriptions.first : nil
        raise "Invalid transcription format: #{json_data.inspect}" unless transcription_entry

        original_text = transcription_entry['transcription']
        hallucination_reason = detect_hallucination(transcription_entry)
        tokens = hallucination_reason ? [] : (transcription_entry['tokens'] || [])
        segments = SegmentParser.from_oci_tokens(tokens)

        {
          text: hallucination_reason ? '' : original_text,
          metadata: build_metadata(json_data, transcription_entry, hallucination_reason, original_text),
          tokens: tokens,
          segments: segments
        }
      end

      def detect_hallucination(transcription_entry)
        confidence = transcription_entry['confidence'].to_f
        return 'low_confidence' if confidence < HALLUCINATION_THRESHOLDS[:min_overall_confidence]

        nil
      end

      def build_metadata(json_data, transcription_entry, hallucination_reason, original_text)
        metadata = {
          provider: 'oci',
          overall_confidence: transcription_entry['confidence'].to_f,
          model_type: json_data.dig('modelDetails', 'modelType'),
          language_code: json_data.dig('modelDetails', 'languageCode')
        }

        if hallucination_reason
          metadata[:hallucination_reason] = hallucination_reason
          metadata[:original_text] = original_text
        end

        metadata
      end

      def get_transcription_s3key
        speech_client = OCI::AiSpeech::AIServiceSpeechClient.new(config: Psy::Oci.config)

        tasks_response = speech_client.list_transcription_tasks(job_id)
        tasks = tasks_response.data.items
        task_id = tasks.first.id
        task_details = speech_client.get_transcription_task(job_id, task_id).data
        task_details.output_location.object_names.first
      end

      def admin_job
        @admin_job ||= AdminJobRecord.find_by(id: admin_job_record_id)
      end

      def update_admin_job_progress
        return unless admin_job_record_id

        admin_job&.increment_completed_tasks!
        admin_job&.complete! if admin_job&.total_tasks == admin_job&.completed_tasks
      end
    end
  end
end
