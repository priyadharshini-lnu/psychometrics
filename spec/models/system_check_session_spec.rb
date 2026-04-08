# frozen_string_literal: true

require 'rails_helper'

RSpec.describe SystemCheckSession, type: :model do
  describe 'associations' do
    it { is_expected.to belong_to(:user) }
    it { is_expected.to have_many(:system_check_records).dependent(:destroy) }
  end

  describe 'validations' do
    it { is_expected.to validate_presence_of(:user_id) }
  end

  describe 'scopes' do
    let!(:in_progress_session) { create(:system_check_session, :in_progress) }
    let!(:completed_session) { create(:system_check_session, :completed) }

    describe '.in_progress' do
      it 'returns sessions without finished_at' do
        expect(described_class.in_progress).to include(in_progress_session)
        expect(described_class.in_progress).not_to include(completed_session)
      end
    end

    describe '.completed' do
      it 'returns sessions with finished_at' do
        expect(described_class.completed).to include(completed_session)
        expect(described_class.completed).not_to include(in_progress_session)
      end
    end
  end

  describe '#in_progress?' do
    it 'returns true when finished_at is blank' do
      session = build(:system_check_session, finished_at: nil)

      expect(session.in_progress?).to be true
    end

    it 'returns false when finished_at is present' do
      session = build(:system_check_session, finished_at: Time.zone.now)

      expect(session.in_progress?).to be false
    end
  end

  describe '#completed?' do
    it 'returns true when finished_at is present' do
      session = build(:system_check_session, finished_at: Time.zone.now)

      expect(session.completed?).to be true
    end

    it 'returns false when finished_at is blank' do
      session = build(:system_check_session, finished_at: nil)

      expect(session.completed?).to be false
    end
  end

  describe '#valid_for_campaign?' do
    let(:campaign) { create(:campaign) }
    let(:session) { create(:system_check_session, :completed, finished_at: 30.minutes.ago) }

    before { allow(campaign).to receive(:system_check_validity).and_return(3600) }

    it 'returns true when session is completed and within validity window' do
      expect(session.valid_for_campaign?(campaign)).to be true
    end

    it 'returns false when session is not completed' do
      session.update!(finished_at: nil)

      expect(session.valid_for_campaign?(campaign)).to be false
    end

    it 'returns false when session is expired' do
      session.update!(finished_at: 2.hours.ago)

      expect(session.valid_for_campaign?(campaign)).to be false
    end

    it 'returns true when campaign has no validity limit' do
      allow(campaign).to receive(:system_check_validity).and_return(nil)

      expect(session.valid_for_campaign?(campaign)).to be true
    end
  end

  describe '#finish!' do
    let(:session) { create(:system_check_session, finished_at: nil) }

    it 'sets finished_at to current time' do
      session.finish!

      expect(session.finished_at).to eq(Time.zone.now)
    end
  end

  describe '#latest_records_by_check_type' do
    let(:session) { create(:system_check_session) }
    let!(:old_browser_record) do
      create(:system_check_record, system_check_session: session, check_type: :browser, created_at: 2.hours.ago)
    end
    let!(:new_browser_record) do
      create(:system_check_record, system_check_session: session, check_type: :browser, created_at: 1.hour.ago)
    end
    let!(:network_record) do
      create(:system_check_record, system_check_session: session, check_type: :network, created_at: 30.minutes.ago)
    end

    it 'returns a hash with check_type as key and latest record as value' do
      result = session.latest_records_by_check_type

      expect(result.keys).to match_array(%w[browser network])
      expect(result['browser']).to eq(new_browser_record)
      expect(result['network']).to eq(network_record)
    end

    it 'returns only the most recent record for each check type' do
      result = session.latest_records_by_check_type

      expect(session.system_check_records.where(check_type: :browser).count).to eq(2)
      expect(result['browser']).to eq(new_browser_record)
      expect(result['browser']).not_to eq(old_browser_record)
    end
  end
end
