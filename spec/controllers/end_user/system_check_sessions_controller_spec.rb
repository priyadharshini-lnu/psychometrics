# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EndUser::SystemCheckSessionsController, type: :controller do
  let(:user) { create(:user, :with_project_membership, :with_photo) }
  let(:project) { user.project }
  let(:campaign) { create(:campaign, project: project) }
  let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }

  before { login_user(user) }
  after { sign_out(user) }

  def stub_rectify_command(klass, ok_payload: nil, error: nil)
    allow(klass).to receive(:call) do |*_args, &blk|
      controller.define_singleton_method(:on) do |event, &h|
        case event
          when :ok
            h.call(ok_payload.call) if ok_payload
          when :error
            h.call(error.call) if error
        end
      end

      begin
        controller.instance_exec(&blk)
      ensure
        controller.singleton_class.send(:remove_method, :on)
      end
    end
  end

  describe '#show' do
    let(:system_check_session) { create(:system_check_session, user: user) }

    before { cookies.signed[:system_check_session_id] = system_check_session.id }

    it 'returns the serialized session' do
      get :show, params: { campaign_id: campaign.id, id: system_check_session.id }

      expect(response).to have_http_status(:ok)
      json_response = response.parsed_body
      expect(json_response['id']).to eq(system_check_session.id)
    end

    context 'when session does not exist' do
      before { cookies.signed[:system_check_session_id] = -1 }

      it 'raises RecordNotFound' do
        expect do
          get :show, params: { campaign_id: campaign.id, id: -1 }
        end.to raise_error(ActiveRecord::RecordNotFound)
      end
    end
  end

  describe '#create' do
    context 'when system check is enabled' do
      before do
        allow_any_instance_of(Campaign).to receive(:system_check_enabled?).and_return(true)
        allow_any_instance_of(Campaign).to receive(:system_check_validity).and_return(1800)
      end

      it 'creates a new system check session with correct attributes' do
        expect do
          post :create, params: { campaign_id: campaign.id }
        end.to change(SystemCheckSession, :count).by(1)

        expect(response).to have_http_status(:created)
        json_response = response.parsed_body
        expect(json_response['id']).to be_present
        expect(json_response['user_id']).to eq(user.id)
        expect(json_response['in_progress']).to be true
        expect(json_response['completed']).to be false
      end
    end

    context 'when system check is not enabled' do
      before do
        allow_any_instance_of(Campaign).to receive(:system_check_enabled?).and_return(false)
      end

      it 'returns unprocessable entity' do
        post :create, params: { campaign_id: campaign.id }

        expect(response).to have_http_status(:unprocessable_entity)
        expect(response.parsed_body['error']).to eq(I18n.t('enduser.system_check_not_enabled'))
      end
    end
  end

  describe '#requirements_status' do
    before do
      allow_any_instance_of(Campaign).to receive(:system_check_enabled?).and_return(true)
    end

    context 'when no session exists in cookie' do
      it 'returns is_valid false with nil session_id' do
        get :requirements_status, params: { campaign_id: campaign.id }

        expect(response).to have_http_status(:ok)
        json_response = response.parsed_body
        expect(json_response['session_id']).to be_nil
        expect(json_response['is_valid']).to be false
        expect(json_response['requirements']).to be_present
      end
    end

    context 'when a valid session exists' do
      let(:system_check_session) do
        create(:system_check_session, :completed, user: user, finished_at: 30.minutes.ago)
      end

      before do
        allow_any_instance_of(Campaign).to receive(:system_check_validity).and_return(3600)
        cookies.signed[:system_check_session_id] = system_check_session.id
        create(:system_check_record, :browser, system_check_session: system_check_session, passed: true)
        create(:system_check_record, :network, system_check_session: system_check_session,
                                               passed: true,
                                               data: { 'download_speed_mbps' => 50, 'upload_speed_mbps' => 50 })
      end

      it 'returns is_valid true with session_id' do
        get :requirements_status, params: { campaign_id: campaign.id }

        expect(response).to have_http_status(:ok)
        json_response = response.parsed_body
        expect(json_response['session_id']).to eq(system_check_session.id)
        expect(json_response['is_valid']).to be true
        expect(json_response['requirements']).to be_present
      end
    end

    context 'when session has unsatisfied checks and allow_continue_with_warning is true' do
      let(:system_check_session) do
        create(:system_check_session, :completed, user: user, finished_at: 30.minutes.ago)
      end

      before do
        allow_any_instance_of(Campaign).to receive(:system_check_validity).and_return(3600)
        allow_any_instance_of(Campaign).to receive(:allow_continue_with_warning?).and_return(true)
        cookies.signed[:system_check_session_id] = system_check_session.id
        create(:system_check_record, :browser, system_check_session: system_check_session, passed: true)
        create(:system_check_record, :network, system_check_session: system_check_session,
                                               passed: false,
                                               data: { 'download_speed_mbps' => 1, 'upload_speed_mbps' => 1 })
      end

      it 'returns is_valid true despite unsatisfied checks' do
        get :requirements_status, params: { campaign_id: campaign.id }

        expect(response).to have_http_status(:ok)
        json_response = response.parsed_body
        expect(json_response['session_id']).to eq(system_check_session.id)
        expect(json_response['is_valid']).to be true
      end
    end

    context 'when no session exists and allow_continue_with_warning is true' do
      before do
        allow_any_instance_of(Campaign).to receive(:allow_continue_with_warning?).and_return(true)
      end

      it 'returns is_valid false' do
        get :requirements_status, params: { campaign_id: campaign.id }

        expect(response).to have_http_status(:ok)
        json_response = response.parsed_body
        expect(json_response['session_id']).to be_nil
        expect(json_response['is_valid']).to be false
      end
    end

    context 'when session is expired' do
      let(:system_check_session) do
        create(:system_check_session, :completed, user: user, finished_at: 2.hours.ago)
      end

      before do
        allow_any_instance_of(Campaign).to receive(:system_check_validity).and_return(3600)
        cookies.signed[:system_check_session_id] = system_check_session.id
      end

      it 'returns is_valid false with nil session_id' do
        get :requirements_status, params: { campaign_id: campaign.id }

        expect(response).to have_http_status(:ok)
        json_response = response.parsed_body
        expect(json_response['session_id']).to be_nil
        expect(json_response['is_valid']).to be false
      end
    end

    context 'when system check is not enabled' do
      before do
        allow_any_instance_of(Campaign).to receive(:system_check_enabled?).and_return(false)
      end

      it 'returns unprocessable entity' do
        get :requirements_status, params: { campaign_id: campaign.id }

        expect(response).to have_http_status(:unprocessable_entity)
        expect(response.parsed_body['error']).to eq(I18n.t('enduser.system_check_not_enabled'))
      end
    end
  end

  describe '#add_record' do
    let(:system_check_session) { create(:system_check_session, user: user) }

    before { cookies.signed[:system_check_session_id] = system_check_session.id }

    it 'adds a record to the session with correct attributes' do
      expect do
        post :add_record, params: {
          campaign_id: campaign.id,
          id: system_check_session.id,
          check_type: 'browser',
          passed: true,
          data: { browser_name: 'Chrome' }
        }
      end.to change(SystemCheckRecord, :count).by(1)

      expect(response).to have_http_status(:created)
      json_response = response.parsed_body
      expect(json_response['id']).to be_present
      expect(json_response['check_type']).to eq('browser')
      expect(json_response['passed']).to be true
      expect(json_response['data']).to eq({ 'browser_name' => 'Chrome' })
    end

    context 'with invalid check_type' do
      it 'raises ArgumentError' do
        expect do
          post :add_record, params: {
            campaign_id: campaign.id,
            id: system_check_session.id,
            check_type: 'invalid',
            passed: true
          }
        end.to raise_error(ArgumentError)
      end
    end
  end

  describe '#complete' do
    let(:system_check_session) { create(:system_check_session, user: user, finished_at: nil) }

    before { cookies.signed[:system_check_session_id] = system_check_session.id }

    it 'marks the session as finished' do
      post :complete, params: { campaign_id: campaign.id, id: system_check_session.id }

      expect(response).to have_http_status(:ok)
      json_response = response.parsed_body
      expect(json_response['completed']).to be true
      expect(json_response['finished_at']).to be_present
      expect(json_response['in_progress']).to be false
    end
  end

  describe '#results' do
    let(:system_check_session) { create(:system_check_session, user: user) }

    before do
      cookies.signed[:system_check_session_id] = system_check_session.id
      create(:system_check_record,
             system_check_session: system_check_session,
             check_type: :browser,
             passed: true)
      create(:system_check_record,
             system_check_session: system_check_session,
             check_type: :network,
             passed: false)
      stub_wisper_publisher(
        'SystemCheckSessions::RequirementsCalculator', :call, :ok,
        { browser: { required: true }, network: { required: true, minimum_download_speed: 1, minimum_upload_speed: 1 },
          video: { required: false }, audio: { required: false } }
      )
    end

    it 'returns the session and records' do
      get :results, params: { campaign_id: campaign.id, id: system_check_session.id }

      expect(response).to have_http_status(:ok)
      json_response = response.parsed_body
      expect(json_response['session']).to be_present
      expect(json_response['records']).to be_present
      expect(json_response['records'].keys).to match_array(%w[browser network])
    end
  end

  describe '#upload_media_url' do
    let(:system_check_session) { create(:system_check_session, user: user) }
    let(:system_check_record) do
      create(:system_check_record, :video, system_check_session: system_check_session)
    end

    before { cookies.signed[:system_check_session_id] = system_check_session.id }

    context 'when successful' do
      let(:upload_data) { { 'upload_id' => 'upload_1', 'asset_key' => 'asset_1', 'urls' => ['https://example.com/part1'] } }

      before do
        stub_rectify_command(SystemCheckRecords::GetMultipartUploadUrls, ok_payload: lambda {
          { 'upload_id' => 'upload_1', 'asset_key' => 'asset_1', 'urls' => ['https://example.com/part1'] }
        })
      end

      it 'returns multipart upload data' do
        post :upload_media_url, params: {
          campaign_id: campaign.id,
          id: system_check_record.id
        }

        expect(response).to have_http_status(:ok)
        json_response = response.parsed_body
        expect(json_response['upload_id']).to eq('upload_1')
        expect(json_response['asset_key']).to eq('asset_1')
        expect(json_response['urls']).to be_an(Array)
      end
    end

    context 'when error occurs' do
      before do
        stub_rectify_command(SystemCheckRecords::GetMultipartUploadUrls, error: -> { 'Upload failed' })
      end

      it 'returns error' do
        post :upload_media_url, params: {
          campaign_id: campaign.id,
          id: system_check_record.id
        }

        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    context 'with audio check type' do
      let(:system_check_record) do
        create(:system_check_record, :audio, system_check_session: system_check_session)
      end

      before do
        stub_rectify_command(SystemCheckRecords::GetMultipartUploadUrls, ok_payload: lambda {
          { 'upload_id' => 'upload_2', 'asset_key' => 'asset_2', 'urls' => ['https://example.com/part1'] }
        })
      end

      it 'returns multipart upload data for audio' do
        post :upload_media_url, params: {
          campaign_id: campaign.id,
          id: system_check_record.id
        }

        expect(response).to have_http_status(:ok)
      end
    end
  end

  describe '#complete_multipart_upload' do
    let(:system_check_session) { create(:system_check_session, user: user) }
    let(:system_check_record) do
      create(:system_check_record, :video, system_check_session: system_check_session, passed: false)
    end

    before { cookies.signed[:system_check_session_id] = system_check_session.id }

    context 'when successful' do
      before do
        stub_rectify_command(SystemCheckRecords::ProcessMediaUpload, ok_payload: -> { system_check_record })
      end

      it 'returns the updated record' do
        put :complete_multipart_upload, params: {
          campaign_id: campaign.id,
          id: system_check_record.id,
          asset_key: 'asset_1',
          upload_id: 'upload_1',
          parts: [{ part_number: 1, etag: 'etag1' }],
          file_size: 1234,
          content_type: 'video/webm',
          checksum: 'abc123'
        }

        expect(response).to have_http_status(:ok)
        json_response = response.parsed_body
        expect(json_response['id']).to eq(system_check_record.id)
      end
    end

    context 'when error occurs' do
      before do
        stub_rectify_command(SystemCheckRecords::ProcessMediaUpload, error: -> { 'error message' })
      end

      it 'returns error' do
        put :complete_multipart_upload, params: {
          campaign_id: campaign.id,
          id: system_check_record.id,
          asset_key: 'asset_1',
          upload_id: 'upload_1',
          parts: [],
          file_size: 0,
          content_type: 'video/webm',
          checksum: 'bad'
        }

        expect(response).to have_http_status(:unprocessable_entity)
        expect(response.parsed_body['error']).to be_present
      end
    end

    context 'when test_phrase and transcribed_text are provided' do
      before do
        stub_rectify_command(SystemCheckRecords::ProcessMediaUpload, ok_payload: -> { system_check_record })
      end

      it 'accepts phrase verification params and returns the updated record' do
        put :complete_multipart_upload, params: {
          campaign_id: campaign.id,
          id: system_check_record.id,
          asset_key: 'asset_1',
          upload_id: 'upload_1',
          parts: [{ part_number: 1, etag: 'etag1' }],
          file_size: 1234,
          content_type: 'video/webm',
          checksum: 'abc123',
          test_phrase: 'this is a test recording',
          locale: 'en',
          transcribed_text: 'this is a test recording'
        }

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body['id']).to eq(system_check_record.id)
      end
    end
  end

  describe '#update' do
    let(:system_check_session) { create(:system_check_session, user: user) }
    let(:system_check_record) do
      create(:system_check_record, :video,
             system_check_session: system_check_session,
             passed: false,
             data: { 'existing_key' => 'existing_value' })
    end

    before do
      cookies.signed[:system_check_session_id] = system_check_session.id
      # Stub face detection settings on any Campaign instance: enabled with 80% threshold
      # So a ratio of 0.9 (90%) will pass
      allow_any_instance_of(Campaign).to receive(:face_detection_enabled?).and_return(true)
      allow_any_instance_of(Campaign).to receive(:minimum_face_detection_ratio).and_return(80)
    end

    it 'merges new data into existing record data and returns the updated record with computed face_detected' do
      patch :update, params: {
        campaign_id: campaign.id,
        id: system_check_record.id,
        data: { face_detection_ratio: 0.9 }
      }

      expect(response).to have_http_status(:ok)
      json_response = response.parsed_body
      expect(json_response['id']).to eq(system_check_record.id)
      # face_detected is computed: ratio (0.9) >= campaign threshold (0.80)
      expect(json_response['face_detected']).to be_truthy
      expect(json_response['data']['face_detection_ratio']).to be_present
      updated_data = system_check_record.reload.data
      expect(updated_data['existing_key']).to eq('existing_value')
      expect(updated_data['face_detection_ratio']).to be_present
    end

    it 'does not overwrite keys not included in the request' do
      patch :update, params: {
        campaign_id: campaign.id,
        id: system_check_record.id,
        data: { face_detection_ratio: 0.75 }
      }

      expect(system_check_record.reload.data['existing_key']).to eq('existing_value')
    end
  end

  context 'when campaign does not exist' do
    it 'raises RecordNotFound' do
      expect do
        get :show, params: { campaign_id: -1, id: 1 }
      end.to raise_error(ActiveRecord::RecordNotFound)
    end
  end

  context 'when user is not part of campaign' do
    let(:other_campaign) { create(:campaign) }

    it 'raises RecordNotFound' do
      expect do
        get :show, params: { campaign_id: other_campaign.id, id: 1 }
      end.to raise_error(ActiveRecord::RecordNotFound)
    end
  end
end
