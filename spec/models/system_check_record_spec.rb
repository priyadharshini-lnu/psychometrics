# frozen_string_literal: true

require 'rails_helper'

RSpec.describe SystemCheckRecord, type: :model do
  describe 'associations' do
    it { is_expected.to belong_to(:system_check_session) }
  end

  describe 'validations' do
    it { is_expected.to validate_presence_of(:check_type) }

    it 'validates passed inclusion' do
      record = build(:system_check_record, passed: nil)

      expect(record).not_to be_valid
      expect(record.errors[:passed]).to be_present
    end
  end

  describe 'enums' do
    it 'defines check_type enum with expected values' do
      expect(described_class.check_types).to eq(
        'browser' => 'browser',
        'network' => 'network',
        'video' => 'video',
        'audio' => 'audio'
      )
    end
  end

  describe 'scopes' do
    let(:session) { create(:system_check_session) }
    let!(:passed_record) do
      create(:system_check_record, system_check_session: session, passed: true, finished_at: Time.zone.now)
    end
    let!(:failed_record) { create(:system_check_record, system_check_session: session, passed: false) }
    let!(:browser_record) { create(:system_check_record, system_check_session: session, check_type: :browser) }
    let!(:network_record) { create(:system_check_record, system_check_session: session, check_type: :network) }

    describe '.passed' do
      it 'returns records with passed true' do
        expect(described_class.passed.count).to eq(1)
        expect(described_class.passed).to include(passed_record)
      end
    end

    describe '.failed' do
      it 'returns records with passed false' do
        expect(described_class.failed).not_to include(passed_record)
      end
    end

    describe '.by_check_type' do
      it 'returns records of specified check type' do
        expect(described_class.by_check_type(:browser)).to include(browser_record)
        expect(described_class.by_check_type(:browser)).not_to include(network_record)
        expect(described_class.by_check_type(:network)).to include(network_record)
        expect(described_class.by_check_type(:network)).not_to include(browser_record)
      end
    end

    describe '.completed' do
      it 'returns records with finished_at present' do
        expect(described_class.completed.count).to eq(1)
        expect(described_class.completed).to include(passed_record)
      end
    end

    describe '.in_progress' do
      it 'returns records with finished_at nil' do
        expect(described_class.in_progress.count).to eq(3)
        expect(described_class.in_progress).not_to include(passed_record)
      end
    end
  end

  describe 'callbacks' do
    describe 'set_finished_at' do
      context 'when passed changes from false to true' do
        let(:record) { create(:system_check_record, passed: false) }

        it 'sets finished_at to current time' do
          record.update!(passed: true)

          expect(record.finished_at).to eq(Time.zone.now)
        end
      end

      context 'when record is created with passed true' do
        it 'sets finished_at to current time' do
          record = create(:system_check_record, passed: true)

          expect(record.finished_at).to eq(Time.zone.now)
        end
      end

      context 'when passed remains false' do
        let(:record) { create(:system_check_record, passed: false) }

        it 'does not set finished_at' do
          record.update!(data: { foo: 'bar' })

          expect(record.finished_at).to be_nil
        end
      end

      context 'when passed remains true' do
        let(:record) { create(:system_check_record, passed: true) }

        it 'does not update finished_at' do
          original_finished_at = record.finished_at
          record.update!(data: { foo: 'bar' })

          expect(record.finished_at).to eq(original_finished_at)
        end
      end
    end
  end

  describe '#attachment_storage_path' do
    let(:user) { create(:user) }
    let(:session) { create(:system_check_session, user: user) }
    let(:record) { create(:system_check_record, :video, system_check_session: session) }

    it 'returns the correct storage path format' do
      path = record.attachment_storage_path(:media, 'test_video.webm')
      expected_path = "private/system_check_videos/users/#{user.id}/sessions/" \
                      "#{session.id}/#{record.id}/video/test_video.webm"

      expect(path).to eq(expected_path)
    end

    it 'uses check_type in the path' do
      audio_record = create(:system_check_record, :audio, system_check_session: session)
      path = audio_record.attachment_storage_path(:media, 'test_audio.webm')

      expect(path).to include('/audio/')
    end
  end

  describe '#media_url' do
    let(:record) { create(:system_check_record, :video) }

    context 'when media is not attached' do
      it 'returns nil' do
        expect(record.media_url).to be_nil
      end
    end

    context 'when media is attached' do
      before do
        allow(record).to receive_message_chain(:media, :attached?).and_return(true)
        allow(record).to receive_message_chain(:media, :url).
          with(expires_in: 1.hour).
          and_return('https://example.com/video.webm')
      end

      it 'returns a signed URL' do
        expect(record.media_url).to eq('https://example.com/video.webm')
      end
    end
  end

  describe '#meets_network_requirements?' do
    let(:session) { create(:system_check_session) }

    context 'when record is a network check' do
      let(:record) do
        create(:system_check_record, :network,
               system_check_session: session,
               passed: true,
               data: { 'download_speed_mbps' => 15, 'upload_speed_mbps' => 10 })
      end

      it 'returns true when speeds meet requirements' do
        result = record.meets_network_requirements?(minimum_download_speed: 10, minimum_upload_speed: 5)

        expect(result).to be true
      end

      it 'returns false when download speed is below minimum' do
        result = record.meets_network_requirements?(minimum_download_speed: 20, minimum_upload_speed: 5)

        expect(result).to be false
      end

      it 'returns false when upload speed is below minimum' do
        result = record.meets_network_requirements?(minimum_download_speed: 10, minimum_upload_speed: 15)

        expect(result).to be false
      end

      it 'returns true when speeds exactly equal minimums' do
        result = record.meets_network_requirements?(minimum_download_speed: 15, minimum_upload_speed: 10)

        expect(result).to be true
      end
    end

    context 'when record is not a network check' do
      let(:record) do
        create(:system_check_record, :browser,
               system_check_session: session,
               passed: true)
      end

      it 'returns false' do
        result = record.meets_network_requirements?(minimum_download_speed: 1, minimum_upload_speed: 1)

        expect(result).to be false
      end
    end

    context 'when data is nil' do
      let(:record) do
        create(:system_check_record, :network,
               system_check_session: session,
               passed: false,
               data: nil)
      end

      it 'returns false' do
        result = record.meets_network_requirements?(minimum_download_speed: 1, minimum_upload_speed: 1)

        expect(result).to be false
      end
    end
  end

  describe '#meets_face_detection_requirements?' do
    let(:session) { create(:system_check_session) }

    context 'when record is a video check' do
      let(:record) do
        create(:system_check_record, :video,
               system_check_session: session,
               passed: true,
               data: { 'face_detection_ratio' => 0.9 })
      end

      it 'returns true when ratio meets the minimum' do
        expect(record.meets_face_detection_requirements?(minimum_ratio: 0.85)).to be true
      end

      it 'returns true when ratio exactly equals the minimum' do
        expect(record.meets_face_detection_requirements?(minimum_ratio: 0.9)).to be true
      end

      it 'returns false when ratio is below the minimum' do
        expect(record.meets_face_detection_requirements?(minimum_ratio: 0.95)).to be false
      end
    end

    context 'when record is not a video check' do
      let(:record) do
        create(:system_check_record, :audio,
               system_check_session: session,
               passed: true,
               data: { 'face_detection_ratio' => 0.99 })
      end

      it 'returns false regardless of the ratio' do
        expect(record.meets_face_detection_requirements?(minimum_ratio: 0.0)).to be false
      end
    end

    context 'when data is nil' do
      let(:record) do
        create(:system_check_record, :video,
               system_check_session: session,
               passed: false,
               data: nil)
      end

      it 'returns false' do
        expect(record.meets_face_detection_requirements?(minimum_ratio: 0.85)).to be false
      end
    end
  end
end
