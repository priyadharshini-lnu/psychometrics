# frozen_string_literal: true

require 'rails_helper'

RSpec.describe SystemCheckSessions::GetSystemCheckStatus do
  subject(:result) { described_class.call!(session: system_check_session, requirements: requirements) }

  let(:user) { create(:user) }
  let(:system_check_session) { create(:system_check_session, :completed, user: user) }

  let(:requirements) do
    {
      browser: { required: true },
      network: { required: true, minimum_download_speed: 10, minimum_upload_speed: 5 },
      video: { required: false }
    }
  end

  describe '#call' do
    context 'when session is nil' do
      let(:system_check_session) { nil }

      it 'returns nil' do
        expect(result).to be_nil
      end
    end

    context 'when all required checks are satisfied' do
      before do
        create(:system_check_record, :browser, system_check_session: system_check_session, passed: true)
        create(:system_check_record, :network, system_check_session: system_check_session,
                                               passed: true,
                                               data: { 'download_speed_mbps' => 15, 'upload_speed_mbps' => 10 })
      end

      it 'returns satisfied for browser' do
        expect(result[:browser]).to eq(:satisfied)
      end

      it 'returns satisfied for network' do
        expect(result[:network]).to eq(:satisfied)
      end

      it 'returns not_required for video' do
        expect(result[:video]).to eq(:not_required)
      end
    end

    context 'when browser check failed' do
      before do
        create(:system_check_record, :browser, system_check_session: system_check_session, passed: false)
        create(:system_check_record, :network, system_check_session: system_check_session,
                                               passed: true,
                                               data: { 'download_speed_mbps' => 15, 'upload_speed_mbps' => 10 })
      end

      it 'returns unsatisfied for browser' do
        expect(result[:browser]).to eq(:unsatisfied)
      end
    end

    context 'when network speed is below minimum' do
      before do
        create(:system_check_record, :browser, system_check_session: system_check_session, passed: true)
        create(:system_check_record, :network, system_check_session: system_check_session,
                                               passed: true,
                                               data: { 'download_speed_mbps' => 5, 'upload_speed_mbps' => 2 })
      end

      it 'returns unsatisfied for network' do
        expect(result[:network]).to eq(:unsatisfied)
      end
    end

    context 'when video is required but missing' do
      let(:requirements) do
        {
          browser: { required: true },
          network: { required: true, minimum_download_speed: 10, minimum_upload_speed: 5 },
          video: { required: true }
        }
      end

      before do
        create(:system_check_record, :browser, system_check_session: system_check_session, passed: true)
        create(:system_check_record, :network, system_check_session: system_check_session,
                                               passed: true,
                                               data: { 'download_speed_mbps' => 15, 'upload_speed_mbps' => 10 })
      end

      it 'returns unsatisfied for video' do
        expect(result[:video]).to eq(:unsatisfied)
      end
    end

    context 'when video is required and passed' do
      let(:requirements) do
        {
          browser: { required: true },
          network: { required: true, minimum_download_speed: 10, minimum_upload_speed: 5 },
          video: { required: true }
        }
      end

      before do
        create(:system_check_record, :browser, system_check_session: system_check_session, passed: true)
        create(:system_check_record, :network, system_check_session: system_check_session,
                                               passed: true,
                                               data: { 'download_speed_mbps' => 15, 'upload_speed_mbps' => 10 })
        create(:system_check_record, :video, system_check_session: system_check_session, passed: true)
      end

      it 'returns satisfied for video' do
        expect(result[:video]).to eq(:satisfied)
      end
    end

    context 'when no records exist' do
      it 'returns unsatisfied for required checks' do
        expect(result[:browser]).to eq(:unsatisfied)
        expect(result[:network]).to eq(:unsatisfied)
      end

      it 'returns not_required for non-required checks' do
        expect(result[:video]).to eq(:not_required)
      end
    end
  end
end
