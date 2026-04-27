# frozen_string_literal: true

require 'rails_helper'

RSpec.describe SystemCheckSessions::SystemCheckStatusSerializable do
  let(:user) { create(:user) }
  let(:project) { create(:project) }
  let(:campaign) { create(:campaign, project: project) }
  let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }
  let(:assessment) { create(:assessment) }

  let(:serializer_context) do
    { current_user: user, system_check_session_id: system_check_session&.id }
  end

  let(:system_check_session) { nil }

  before do
    create(:campaign_assessment, campaign: campaign, assessment: assessment)
    create(:user_assessment, campaign: campaign, assessment: assessment, subject: user)
    allow_any_instance_of(Campaign).to receive(:system_check_enabled?).and_return(true)
    allow_any_instance_of(Campaign).to receive(:system_check_validity).and_return(3600)
  end

  let(:response) do
    serializer = EndUser::ShortCampaignSerializer.new(context: serializer_context)
    serializer.serialize(campaign)
  end

  describe '#system_check_status' do
    context 'when system check is disabled' do
      before do
        allow_any_instance_of(Campaign).to receive(:system_check_enabled?).and_return(false)
      end

      it 'returns nil' do
        expect(response['system_check_status']).to be_nil
      end
    end

    context 'when user has no campaign_user' do
      before do
        campaign_user.destroy!
        allow_any_instance_of(EndUser::ShortCampaignSerializer).to receive(:progress_status).and_return(nil)
      end

      it 'returns nil' do
        expect(response['system_check_status']).to be_nil
      end
    end

    context 'when no session exists' do
      it 'returns is_valid false with nil session_id' do
        status = response['system_check_status']

        expect(status['session_id']).to be_nil
        expect(status['is_valid']).to be false
      end
    end

    context 'when a valid session exists with all checks passing' do
      let(:system_check_session) do
        create(:system_check_session, :completed, user: user, finished_at: 30.minutes.ago)
      end

      before do
        create(:system_check_record, :browser, system_check_session: system_check_session, passed: true)
        create(:system_check_record, :network, system_check_session: system_check_session,
                                               passed: true,
                                               data: { 'download_speed_mbps' => 50, 'upload_speed_mbps' => 50 })
      end

      it 'returns is_valid true with session_id' do
        status = response['system_check_status']

        expect(status['session_id']).to eq(system_check_session.id)
        expect(status['is_valid']).to be true
      end

      it 'includes requirements' do
        status = response['system_check_status']

        expect(status['requirements']).to be_present
        expect(status['requirements']['browser']).to be_present
        expect(status['requirements']['network']).to be_present
        expect(status['requirements']['video']).to be_present
        expect(status['requirements']['audio']).to be_present
      end
    end

    context 'when session is expired' do
      let(:system_check_session) do
        create(:system_check_session, :completed, user: user, finished_at: 2.hours.ago)
      end

      it 'returns is_valid false' do
        status = response['system_check_status']

        expect(status['session_id']).to be_nil
        expect(status['is_valid']).to be false
      end
    end

    context 'when session has unsatisfied checks and allow_continue_with_warning is true' do
      let(:system_check_session) do
        create(:system_check_session, :completed, user: user, finished_at: 30.minutes.ago)
      end

      before do
        allow_any_instance_of(Campaign).to receive(:allow_continue_with_warning?).and_return(true)
        create(:system_check_record, :browser, system_check_session: system_check_session, passed: true)
        create(:system_check_record, :network, system_check_session: system_check_session,
                                               passed: false,
                                               data: { 'download_speed_mbps' => 1, 'upload_speed_mbps' => 1 })
      end

      it 'returns is_valid true despite unsatisfied checks' do
        status = response['system_check_status']

        expect(status['session_id']).to eq(system_check_session.id)
        expect(status['is_valid']).to be true
      end
    end

    context 'when no session exists and allow_continue_with_warning is true' do
      before do
        allow_any_instance_of(Campaign).to receive(:allow_continue_with_warning?).and_return(true)
      end

      it 'returns is_valid false without a session' do
        status = response['system_check_status']

        expect(status['session_id']).to be_nil
        expect(status['is_valid']).to be false
      end
    end
  end
end
