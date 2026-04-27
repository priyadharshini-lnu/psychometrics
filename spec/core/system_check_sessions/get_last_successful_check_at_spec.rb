# frozen_string_literal: true

require 'rails_helper'

RSpec.describe SystemCheckSessions::GetLastSuccessfulCheckAt do
  subject(:call_result) { described_class.new(campaign_user: campaign_user).query }

  let(:user) { create(:user) }
  let(:campaign) { create(:campaign) }
  let(:campaign_user) { create(:campaign_user, user: user, campaign: campaign) }

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
    context 'when no completed sessions exist' do
      it 'returns nil' do
        expect(call_result).to be_nil
      end
    end

    context 'when a session has all checks passed' do
      let!(:session) { create(:system_check_session, :completed, user: user, finished_at: 1.hour.ago) }

      before do
        create(:system_check_record, :browser, system_check_session: session, passed: true)
        create(:system_check_record, :network, system_check_session: session,
                                               passed: true,
                                               data: { 'download_speed_mbps' => 15, 'upload_speed_mbps' => 10 })
      end

      it 'returns the finished_at epoch' do
        expect(call_result).to eq(session.finished_at.to_i)
      end
    end

    context 'when session has failed checks' do
      let!(:session) { create(:system_check_session, :completed, user: user, finished_at: 1.hour.ago) }

      before do
        create(:system_check_record, :browser, system_check_session: session, passed: false)
        create(:system_check_record, :network, system_check_session: session,
                                               passed: true,
                                               data: { 'download_speed_mbps' => 15, 'upload_speed_mbps' => 10 })
      end

      it 'returns nil' do
        expect(call_result).to be_nil
      end
    end

    context 'when session is expired but all checks passed' do
      let!(:session) { create(:system_check_session, :completed, user: user, finished_at: 2.days.ago) }

      before do
        allow_any_instance_of(Campaign).to receive(:system_check_validity).and_return(3600)
        create(:system_check_record, :browser, system_check_session: session, passed: true)
        create(:system_check_record, :network, system_check_session: session,
                                               passed: true,
                                               data: { 'download_speed_mbps' => 15, 'upload_speed_mbps' => 10 })
      end

      it 'still returns the finished_at epoch' do
        expect(call_result).to eq(session.finished_at.to_i)
      end
    end

    context 'when multiple sessions exist' do
      let!(:older_session) { create(:system_check_session, :completed, user: user, finished_at: 3.hours.ago) }
      let!(:newer_session) { create(:system_check_session, :completed, user: user, finished_at: 1.hour.ago) }

      before do
        create(:system_check_record, :browser, system_check_session: older_session, passed: true)
        create(:system_check_record, :network, system_check_session: older_session,
                                               passed: true,
                                               data: { 'download_speed_mbps' => 15, 'upload_speed_mbps' => 10 })

        create(:system_check_record, :browser, system_check_session: newer_session, passed: true)
        create(:system_check_record, :network, system_check_session: newer_session,
                                               passed: true,
                                               data: { 'download_speed_mbps' => 15, 'upload_speed_mbps' => 10 })
      end

      it 'returns the most recent successful session epoch' do
        expect(call_result).to eq(newer_session.finished_at.to_i)
      end
    end

    context 'when only older session passed and newer session failed' do
      let!(:older_session) { create(:system_check_session, :completed, user: user, finished_at: 3.hours.ago) }
      let!(:newer_session) { create(:system_check_session, :completed, user: user, finished_at: 1.hour.ago) }

      before do
        create(:system_check_record, :browser, system_check_session: older_session, passed: true)
        create(:system_check_record, :network, system_check_session: older_session,
                                               passed: true,
                                               data: { 'download_speed_mbps' => 15, 'upload_speed_mbps' => 10 })

        create(:system_check_record, :browser, system_check_session: newer_session, passed: false)
      end

      it 'returns the older successful session epoch' do
        expect(call_result).to eq(older_session.finished_at.to_i)
      end
    end

    context 'when session is in progress' do
      before do
        create(:system_check_session, :in_progress, user: user)
      end

      it 'returns nil' do
        expect(call_result).to be_nil
      end
    end

    context 'when allow_continue_with_warning is true and checks have not passed' do
      let!(:session) { create(:system_check_session, :completed, user: user, finished_at: 1.hour.ago) }

      before do
        allow_any_instance_of(Campaign).to receive(:allow_continue_with_warning?).and_return(true)
        create(:system_check_record, :browser, system_check_session: session, passed: false)
      end

      it 'returns the finished_at epoch' do
        expect(call_result).to eq(session.finished_at.to_i)
      end
    end
  end
end
