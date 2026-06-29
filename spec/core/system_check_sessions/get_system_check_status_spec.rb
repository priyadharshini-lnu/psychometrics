# frozen_string_literal: true

require 'rails_helper'

RSpec.describe SystemCheckSessions::GetSystemCheckStatus do
  subject(:call_result) { described_class.call!(session_id: system_check_session&.id, campaign_user: campaign_user) }

  let(:user) { create(:user) }
  let(:campaign) { create(:campaign) }
  let(:campaign_user) { create(:campaign_user, user: user, campaign: campaign) }
  let(:system_check_session) { create(:system_check_session, :completed, user: user) }

  let(:requirements) do
    {
      browser: { required: true },
      network: { required: true, minimum_download_speed: 10, minimum_upload_speed: 5 },
      video: { required: false },
      audio: { required: false }
    }
  end

  before do
    allow(SystemCheckSessions::RequirementsCalculator).to receive(:call!).and_return(requirements)
  end

  describe '#call' do
    context 'when session is nil' do
      let(:system_check_session) { nil }

      it 'returns is_valid false with nil session_id' do
        expect(call_result[:session_id]).to be_nil
        expect(call_result[:requirements]).to eq(requirements)
        expect(call_result[:is_valid]).to be false
      end
    end

    context 'when all required checks are satisfied' do
      before do
        create(:system_check_record, :browser, system_check_session: system_check_session, passed: true)
        create(:system_check_record, :network, system_check_session: system_check_session,
                                               passed: true,
                                               data: { 'download_speed_mbps' => 15, 'upload_speed_mbps' => 10 })
      end

      it 'returns is_valid true with session_id' do
        expect(call_result[:is_valid]).to be true
        expect(call_result[:session_id]).to eq(system_check_session.id)
      end
    end

    context 'when browser check fails' do
      before do
        create(:system_check_record, :browser, system_check_session: system_check_session, passed: false)
        create(:system_check_record, :network, system_check_session: system_check_session,
                                               passed: true,
                                               data: { 'download_speed_mbps' => 15, 'upload_speed_mbps' => 10 })
      end

      it 'returns is_valid false' do
        expect(call_result[:is_valid]).to be false
      end
    end

    context 'when network speed is below minimum' do
      before do
        create(:system_check_record, :browser, system_check_session: system_check_session, passed: true)
        create(:system_check_record, :network, system_check_session: system_check_session,
                                               passed: true,
                                               data: { 'download_speed_mbps' => 5, 'upload_speed_mbps' => 2 })
      end

      it 'returns is_valid false' do
        expect(call_result[:is_valid]).to be false
      end
    end

    context 'when video is required but missing' do
      let(:requirements) do
        {
          browser: { required: true },
          network: { required: true, minimum_download_speed: 10, minimum_upload_speed: 5 },
          video: { required: true },
          audio: { required: false }
        }
      end

      before do
        create(:system_check_record, :browser, system_check_session: system_check_session, passed: true)
        create(:system_check_record, :network, system_check_session: system_check_session,
                                               passed: true,
                                               data: { 'download_speed_mbps' => 15, 'upload_speed_mbps' => 10 })
      end

      it 'returns is_valid false' do
        expect(call_result[:is_valid]).to be false
      end
    end

    context 'when video is required and passed' do
      let(:requirements) do
        {
          browser: { required: true },
          network: { required: true, minimum_download_speed: 10, minimum_upload_speed: 5 },
          video: { required: true },
          audio: { required: false }
        }
      end

      before do
        create(:system_check_record, :browser, system_check_session: system_check_session, passed: true)
        create(:system_check_record, :network, system_check_session: system_check_session,
                                               passed: true,
                                               data: { 'download_speed_mbps' => 15, 'upload_speed_mbps' => 10 })
        create(:system_check_record, :video, system_check_session: system_check_session, passed: true)
      end

      it 'returns is_valid true' do
        expect(call_result[:is_valid]).to be true
      end
    end

    context 'when no records exist' do
      it 'returns is_valid false' do
        expect(call_result[:is_valid]).to be false
      end
    end

    context 'when audio is required but missing' do
      let(:requirements) do
        {
          browser: { required: true },
          network: { required: true, minimum_download_speed: 10, minimum_upload_speed: 5 },
          video: { required: false },
          audio: { required: true }
        }
      end

      before do
        create(:system_check_record, :browser, system_check_session: system_check_session, passed: true)
        create(:system_check_record, :network, system_check_session: system_check_session,
                                               passed: true,
                                               data: { 'download_speed_mbps' => 15, 'upload_speed_mbps' => 10 })
      end

      it 'returns is_valid false' do
        expect(call_result[:is_valid]).to be false
      end
    end

    context 'when audio is required and passed' do
      let(:requirements) do
        {
          browser: { required: true },
          network: { required: true, minimum_download_speed: 10, minimum_upload_speed: 5 },
          video: { required: false },
          audio: { required: true }
        }
      end

      before do
        create(:system_check_record, :browser, system_check_session: system_check_session, passed: true)
        create(:system_check_record, :network, system_check_session: system_check_session,
                                               passed: true,
                                               data: { 'download_speed_mbps' => 15, 'upload_speed_mbps' => 10 })
        create(:system_check_record, :audio, system_check_session: system_check_session, passed: true)
      end

      it 'returns is_valid true' do
        expect(call_result[:is_valid]).to be true
      end
    end

    context 'when audio is required but satisfied by a passed video check' do
      let(:requirements) do
        {
          browser: { required: true },
          network: { required: true, minimum_download_speed: 10, minimum_upload_speed: 5 },
          video: { required: false },
          audio: { required: true }
        }
      end

      before do
        create(:system_check_record, :browser, system_check_session: system_check_session, passed: true)
        create(:system_check_record, :network, system_check_session: system_check_session,
                                               passed: true,
                                               data: { 'download_speed_mbps' => 15, 'upload_speed_mbps' => 10 })
        create(:system_check_record, :video, system_check_session: system_check_session, passed: true)
      end

      it 'returns is_valid true' do
        expect(call_result[:is_valid]).to be true
      end
    end

    context 'when session is expired' do
      let(:system_check_session) do
        create(:system_check_session, :completed, user: user, finished_at: 2.hours.ago)
      end

      before do
        allow_any_instance_of(Campaign).to receive(:system_check_validity).and_return(3600)
      end

      it 'returns nil session_id and is_valid false' do
        expect(call_result[:session_id]).to be_nil
        expect(call_result[:is_valid]).to be false
      end
    end

    context 'when allow_continue_with_warning is true' do
      before do
        allow_any_instance_of(Campaign).to receive(:allow_continue_with_warning?).and_return(true)
        create(:system_check_record, :browser, system_check_session: system_check_session, passed: false)
      end

      it 'returns is_valid true despite unsatisfied checks' do
        expect(call_result[:is_valid]).to be true
      end
    end

    context 'when video is required and face_detection_enabled' do
      let(:requirements) do
        {
          browser: { required: true },
          network: { required: true, minimum_download_speed: 10, minimum_upload_speed: 5 },
          video: { required: true, face_detection_enabled: true, minimum_face_detection_ratio: 85 },
          audio: { required: false }
        }
      end

      before do
        allow_any_instance_of(Campaign).to receive(:face_detection_enabled?).and_return(true)
        allow_any_instance_of(Campaign).to receive(:minimum_face_detection_ratio).and_return(85)
        allow_any_instance_of(Campaign).to receive(:phrase_verification_enabled?).and_return(false)
        create(:system_check_record, :browser, system_check_session: system_check_session, passed: true)
        create(:system_check_record, :network, system_check_session: system_check_session,
                                               passed: true,
                                               data: { 'download_speed_mbps' => 15, 'upload_speed_mbps' => 10 })
      end

      context 'when face_detection_ratio meets the minimum' do
        before do
          create(:system_check_record, :video, system_check_session: system_check_session,
                                               passed: true,
                                               data: { 'face_detection_ratio' => 0.9 })
        end

        it 'returns is_valid true' do
          expect(call_result[:is_valid]).to be true
        end
      end

      context 'when face_detection_ratio is below the minimum' do
        before do
          create(:system_check_record, :video, system_check_session: system_check_session,
                                               passed: true,
                                               data: { 'face_detection_ratio' => 0.7 })
        end

        it 'returns is_valid false' do
          expect(call_result[:is_valid]).to be false
        end
      end
    end

    context 'when video is required and phrase_verification_enabled' do
      let(:requirements) do
        {
          browser: { required: true },
          network: { required: true, minimum_download_speed: 10, minimum_upload_speed: 5 },
          video: { required: true, face_detection_enabled: false, phrase_verification_enabled: true },
          audio: { required: false }
        }
      end

      before do
        allow_any_instance_of(Campaign).to receive(:face_detection_enabled?).and_return(false)
        allow_any_instance_of(Campaign).to receive(:phrase_verification_enabled?).and_return(true)
        create(:system_check_record, :browser, system_check_session: system_check_session, passed: true)
        create(:system_check_record, :network, system_check_session: system_check_session,
                                               passed: true,
                                               data: { 'download_speed_mbps' => 15, 'upload_speed_mbps' => 10 })
      end

      context 'when phrase_matched is true' do
        before do
          create(:system_check_record, :video, system_check_session: system_check_session,
                                               passed: true,
                                               data: { 'phrase_matched' => true })
        end

        it 'returns is_valid true' do
          expect(call_result[:is_valid]).to be true
        end
      end

      context 'when phrase_matched is false' do
        before do
          create(:system_check_record, :video, system_check_session: system_check_session,
                                               passed: true,
                                               data: { 'phrase_matched' => false })
        end

        it 'returns is_valid false' do
          expect(call_result[:is_valid]).to be false
        end
      end
    end

    context 'when audio is required and phrase_verification_enabled' do
      let(:requirements) do
        {
          browser: { required: true },
          network: { required: true, minimum_download_speed: 10, minimum_upload_speed: 5 },
          video: { required: false },
          audio: { required: true, phrase_verification_enabled: true }
        }
      end

      before do
        allow_any_instance_of(Campaign).to receive(:phrase_verification_enabled?).and_return(true)
        create(:system_check_record, :browser, system_check_session: system_check_session, passed: true)
        create(:system_check_record, :network, system_check_session: system_check_session,
                                               passed: true,
                                               data: { 'download_speed_mbps' => 15, 'upload_speed_mbps' => 10 })
      end

      context 'when phrase_matched is true' do
        before do
          create(:system_check_record, :audio, system_check_session: system_check_session,
                                               passed: true,
                                               data: { 'phrase_matched' => true })
        end

        it 'returns is_valid true' do
          expect(call_result[:is_valid]).to be true
        end
      end

      context 'when phrase_matched is false' do
        before do
          create(:system_check_record, :audio, system_check_session: system_check_session,
                                               passed: true,
                                               data: { 'phrase_matched' => false })
        end

        it 'returns is_valid false' do
          expect(call_result[:is_valid]).to be false
        end
      end
    end

    it 'always returns requirements' do
      expect(call_result[:requirements]).to eq(requirements)
    end
  end
end
