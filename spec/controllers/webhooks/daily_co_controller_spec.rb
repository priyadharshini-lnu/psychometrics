# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Webhooks::DailyCoController, type: :controller do
  let(:api_key) { 'test_api_key' }
  let(:jwt_token) { JWT.encode({ sub: 'dailyco' }, Settings.secrets.webhook_jwt_secret, 'HS256') }
  let(:headers) { { 'Authorization' => "Basic #{jwt_token}" } }
  let(:transcription_s3key) { 'some/s3/transcription/key.vtt' }

  before do
    allow(Settings).to receive_message_chain(:secrets, :webhook_jwt_secret).and_return('test_jwt_secret')
    allow(Settings).to receive_message_chain(:secrets, :encrypted_key, :to_s).and_return('dummy_encrypted_key')
    allow(Settings).to receive(:storage).and_return(double('storage', dailyco_storage_service: :test,
      public_storage_service: :test))
    allow_any_instance_of(MeetingRecording).to receive(:recording_file).and_return(double('attachment',
                                                                                          attached?: false))
    allow_any_instance_of(MeetingRecording).to receive(:transcription_file).and_return(double('attachment',
                                                                                              attached?: false))
    allow_any_instance_of(MeetingRecording).to receive(:enqueue_attach_recording_file_job)
    allow_any_instance_of(MeetingRecording).to receive(:enqueue_attach_transcription_file_job)
  end

  describe 'POST #recordings' do
    let(:workshop) { create(:workshop) }
    let(:room) { MeetingRoom.create!(name: 'test-room', meetable: workshop) }
    let(:recording_id) { 'rec-123' }
    let(:s3_key) { 'some/s3/key' }

    context 'when event is recording.ready-to-download' do
      let!(:recording) { MeetingRecording.create!(meeting_room: room, external_id: recording_id, status: :started) }
      let(:payload) do
        {
          type: 'recording.ready-to-download',
          payload: {
            recording_id: recording_id,
            status: 'finished',
            s3_key: s3_key,
            room_name: room.name
          }
        }.to_json
      end

      it 'updates the MeetingRecording' do
        request.headers.merge!(headers)
        post :recordings, body: payload
        recording.reload
        expect(recording.status).to eq('finished')
        expect(recording.s3key).to eq(s3_key)
        expect(recording.meeting_room).to eq(room)
      end
    end

    context 'when event is transcript.ready-to-download' do
      let!(:recording) do
        MeetingRecording.create!(meeting_room: room, meeting_session_id: 'session-456',
                                 transcription_status: :t_in_progress)
      end
      let(:payload) do
        {
          type: 'transcript.ready-to-download',
          payload: {
            mtg_session_id: 'session-456',
            id: 'transcript-789',
            status: 't_finished',
            out_params: {
              s3: {
                key: transcription_s3key
              }
            },
            room_name: room.name
          }
        }.to_json
      end

      it 'updates the transcription fields' do
        request.headers.merge!(headers)
        post :recordings, body: payload
        recording.reload
        expect(recording.transcription_status).to eq('t_finished')
        expect(recording.transcription_s3key).to eq(transcription_s3key)
      end
    end

    context 'with invalid JSON' do
      it 'returns unprocessable_entity' do
        request.headers.merge!(headers)
        post :recordings, body: 'invalid_json'
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    context 'with invalid auth' do
      it 'returns unauthorized' do
        request.headers['Authorization'] = 'Basic invalidtoken'
        post :recordings, body: '{}'
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
