# frozen_string_literal: true

require 'rails_helper'

describe MediaResponses::Transcriptions::SaveOciSpeechTranscription do
  subject(:command) do
    described_class.new(
      job_id: job_id,
      record_id: media_response_id,
      admin_job_record_id: admin_job_record_id
    )
  end

  let(:media_response_id) { 123 }
  let(:admin_job_record_id) { 456 }

  let(:media_response) do
    instance_double('MediaResponse', transcription: nil)
  end
  let(:job_id) { 'ocid1.aispeechtranscriptionjob.oc1.iad.sample123' }
  let(:task_id) { 'ocid1.aispeechtranscriptiontask.oc1.iad.task123' }
  let(:s3_key) { 'transcriptions/output/result.json' }
  let(:transcription_text) { 'Transcribed text from OCI' }

  let(:s3_client) { instance_double(Aws::S3::Client) }
  let(:bucket) { 'private_bucket' }
  let(:oci_json) { { 'transcriptions' => [{ 'transcription' => transcription_text, 'confidence' => '0.95' }] } }
  let(:response_body) { StringIO.new(oci_json.to_json) }
  let(:s3_response) { instance_double(Aws::S3::Types::GetObjectOutput, body: response_body) }

  let(:speech_client) { instance_double(OCI::AiSpeech::AIServiceSpeechClient) }
  let(:tasks_response) { double(data: double(items: [task])) }
  let(:task) { double(id: task_id) }
  let(:task_details_response) { double(data: task_details) }
  let(:task_details) { double(output_location: output_location) }
  let(:output_location) { double(object_names: [s3_key]) }
  let(:oci_config) { double('OCI Config') }
  let(:admin_job) { instance_double(AdminJobRecord, total_tasks: 10, completed_tasks: 5) }

  before do
    stub_const('Settings', double(
                             secrets: double(
                               s3_compatible_storage:  {
                                 access_key_id: 'key',
                                 secret_access_key: 'secret',
                                 region: 'region',
                                 private_bucket: bucket
                               }
                             ),
                             storage: double(
                               private_storage_service: :test
                             )
                           ))

    allow(MediaResponse).to receive(:find_by).with(id: media_response_id).and_return(media_response)
    allow(AdminJobRecord).to receive(:find_by).with(id: admin_job_record_id).and_return(admin_job)
    allow(admin_job).to receive(:increment_completed_tasks!)
    allow(admin_job).to receive(:complete!)

    allow(Aws::S3::Client).to receive(:new).with(
      access_key_id: 'key',
      secret_access_key: 'secret',
      region: 'region'
    ).and_return(s3_client)
    allow(s3_client).to receive(:get_object).with(bucket: bucket, key: s3_key).and_return(s3_response)

    allow(Psy::Oci).to receive(:config).and_return(oci_config)
    allow(OCI::AiSpeech::AIServiceSpeechClient).to receive(:new).with(config: oci_config).and_return(speech_client)
    allow(speech_client).to receive(:list_transcription_tasks).with(job_id).and_return(tasks_response)
    allow(speech_client).to receive(:get_transcription_task).with(job_id, task_id).and_return(task_details_response)
  end

  describe '#call' do
    context 'when no transcription exists and OCI job completes successfully' do
      before do
        allow(media_response).to receive(:transcription).and_return(nil)
        allow(media_response).to receive(:save_transcription_completed!)
      end

      it 'retrieves the S3 key from OCI Speech API' do
        expect(speech_client).to receive(:list_transcription_tasks).with(job_id)
        expect(speech_client).to receive(:get_transcription_task).with(job_id, task_id)
        command.call
      end

      it 'fetches transcription from S3 using the retrieved key' do
        expect(s3_client).to receive(:get_object).with(bucket: bucket, key: s3_key)
        command.call
      end

      it 'saves the transcription as completed with extracted text' do
        expect(media_response).to receive(:save_transcription_completed!).with(transcription_text,
                                                                               metadata: anything, segments: [])
        command.call
      end

      it 'broadcasts :ok' do
        expect(command).to receive(:broadcast).with(:ok, anything)
        command.call
      end

      it 'updates admin job progress' do
        expect(admin_job).to receive(:increment_completed_tasks!)
        command.call
      end

      it 'completes admin job when all tasks are done' do
        allow(admin_job).to receive(:total_tasks).and_return(6)
        allow(admin_job).to receive(:completed_tasks).and_return(5)
        allow(admin_job).to receive(:increment_completed_tasks!) do
          allow(admin_job).to receive(:completed_tasks).and_return(6)
        end
        expect(admin_job).to receive(:complete!)
        command.call
      end
    end

    context 'when transcription already exists' do
      let(:existing_transcription) { instance_double('Transcription') }

      before do
        allow(media_response).to receive(:transcription).and_return(existing_transcription)
        allow(media_response).to receive(:save_transcription_completed!)
      end

      it 'saves the transcription using save_transcription_completed!' do
        expect(media_response).to receive(:save_transcription_completed!).with(transcription_text,
                                                                               metadata: anything, segments: [])
        command.call
      end
    end

    context 'when media_response is not found' do
      before do
        allow(MediaResponse).to receive(:find_by).with(id: media_response_id).and_return(nil)
      end

      it 'does not process the transcription' do
        expect(speech_client).not_to receive(:list_transcription_tasks)
        expect(s3_client).not_to receive(:get_object)
        command.call
      end

      it 'returns nil' do
        result = command.call
        expect(result).to be_nil
      end
    end

    context 'when JSON does not contain the expected transcription format' do
      let(:invalid_json) { { 'not_transcriptions' => [] } }
      let(:invalid_response_body) { StringIO.new(invalid_json.to_json) }
      let(:invalid_s3_response) { instance_double(Aws::S3::Types::GetObjectOutput, body: invalid_response_body) }

      before do
        allow(media_response).to receive(:save_transcription_completed!)
        allow(s3_client).to receive(:get_object).and_return(invalid_s3_response)
      end

      it 'raises an error for invalid format' do
        expect { command.call }.to raise_error(/Invalid transcription format/)
      end
    end

    context 'when transcriptions array is empty' do
      let(:empty_json) { { 'transcriptions' => [] } }
      let(:empty_response_body) { StringIO.new(empty_json.to_json) }
      let(:empty_s3_response) { instance_double(Aws::S3::Types::GetObjectOutput, body: empty_response_body) }

      before do
        allow(media_response).to receive(:save_transcription_completed!)
        allow(s3_client).to receive(:get_object).and_return(empty_s3_response)
      end

      it 'raises an error' do
        expect { command.call }.to raise_error(/Invalid transcription format/)
      end
    end

    context 'when transcriptions is not an array' do
      let(:malformed_json) { { 'transcriptions' => 'not an array' } }
      let(:malformed_response_body) { StringIO.new(malformed_json.to_json) }
      let(:malformed_s3_response) { instance_double(Aws::S3::Types::GetObjectOutput, body: malformed_response_body) }

      before do
        allow(media_response).to receive(:save_transcription_completed!)
        allow(s3_client).to receive(:get_object).and_return(malformed_s3_response)
      end

      it 'raises an error' do
        expect { command.call }.to raise_error(/Invalid transcription format/)
      end
    end

    context 'when OCI API returns no tasks' do
      let(:empty_tasks_response) { double(data: double(items: [])) }

      before do
        allow(media_response).to receive(:save_transcription_completed!)
        allow(speech_client).to receive(:list_transcription_tasks).and_return(empty_tasks_response)
      end

      it 'raises an error when trying to access first task' do
        expect { command.call }.to raise_error(NoMethodError)
      end
    end

    context 'when OCI task has no output object names' do
      let(:empty_output_location) { double(object_names: []) }
      let(:empty_task_details) { double(output_location: empty_output_location) }
      let(:empty_task_details_response) { double(data: empty_task_details) }

      before do
        allow(media_response).to receive(:save_transcription_completed!)
        allow(speech_client).to receive(:get_transcription_task).and_return(empty_task_details_response)
        allow(s3_client).to receive(:get_object).
          with(bucket: bucket, key: nil).
          and_raise(Aws::S3::Errors::NoSuchKey.new(nil, 'Key cannot be nil'))
      end

      it 'raises an error when trying to get object from S3' do
        expect { command.call }.to raise_error(Aws::S3::Errors::NoSuchKey)
      end
    end
  end

  describe 'S3 client initialization' do
    before do
      allow(media_response).to receive(:save_transcription_completed!)
    end

    it 'creates S3 client with correct credentials' do
      command.call

      expect(Aws::S3::Client).to have_received(:new).with(
        access_key_id:  'key',
        secret_access_key: 'secret',
        region: 'region'
      )
    end
  end

  describe 'OCI Speech client initialization' do
    before do
      allow(media_response).to receive(:save_transcription_completed!)
    end

    it 'creates OCI client with Psy::Oci config' do
      command.call

      expect(OCI::AiSpeech::AIServiceSpeechClient).to have_received(:new).with(config: oci_config)
    end
  end
end
