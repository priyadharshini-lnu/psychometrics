# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EndUser::SystemCheckRecordSerializer do
  let(:system_check_session) { create(:system_check_session) }
  let(:system_check_record) do
    create(:system_check_record,
           system_check_session: system_check_session,
           check_type: :browser,
           passed: true,
           data: { user_agent: 'Chrome', version: '100' },
           finished_at: Time.zone.now)
  end

  subject { described_class.new.serialize(system_check_record) }

  describe 'attributes' do
    it 'serializes main attributes correctly' do
      result = subject

      expect(result['id']).to eq(system_check_record.id)
      expect(result['check_type']).to eq('browser')
      expect(result['passed']).to be true
      expect(result['data']).to eq({ 'user_agent' => 'Chrome', 'version' => '100' })
      expect(result['created_at']).to be_present
      expect(result['finished_at']).to be_present
      expect(result).to have_key('media_url')
    end
  end

  describe '#media_url' do
    context 'when media is not attached' do
      it 'returns nil' do
        expect(subject['media_url']).to be_nil
      end
    end

    context 'when media is attached' do
      before do
        allow(system_check_record).to receive(:media_url).and_return('https://example.com/video.webm')
      end

      it 'returns the media URL' do
        result = described_class.new.serialize(system_check_record)

        expect(result['media_url']).to eq('https://example.com/video.webm')
      end
    end
  end

  describe 'different check types' do
    %i[browser network video audio].each do |check_type|
      context "with #{check_type} check type" do
        let(:system_check_record) do
          create(:system_check_record, system_check_session: system_check_session, check_type: check_type)
        end

        it "serializes #{check_type} correctly" do
          result = described_class.new.serialize(system_check_record)

          expect(result['check_type']).to eq(check_type.to_s)
        end
      end
    end
  end

  describe '#phrase_verification_status' do
    context 'when data contains phrase_verification_status' do
      let(:system_check_record) do
        create(:system_check_record, :audio,
               system_check_session: system_check_session,
               data: { 'phrase_verification_status' => 'completed' })
      end

      it 'returns the status' do
        expect(described_class.new.serialize(system_check_record)['phrase_verification_status']).to eq('completed')
      end
    end

    context 'when data does not contain phrase_verification_status' do
      it 'returns nil' do
        expect(subject['phrase_verification_status']).to be_nil
      end
    end
  end

  describe '#phrase_matched' do
    context 'when data contains phrase_matched' do
      let(:system_check_record) do
        create(:system_check_record, :audio,
               system_check_session: system_check_session,
               data: { 'phrase_matched' => true })
      end

      it 'returns the value' do
        expect(described_class.new.serialize(system_check_record)['phrase_matched']).to be true
      end
    end

    context 'when data does not contain phrase_matched' do
      it 'returns nil' do
        expect(subject['phrase_matched']).to be_nil
      end
    end
  end

  describe '#passed with campaign_user context' do
    let(:campaign) { create(:campaign) }
    let(:campaign_user) { create(:campaign_user, campaign: campaign) }

    def serialize_with_context(record)
      described_class.new(context: { campaign_user: campaign_user }).serialize(record)
    end

    context 'with a network record' do
      let(:record) do
        create(:system_check_record, :network,
               system_check_session: system_check_session,
               passed: true,
               data: { 'download_speed_mbps' => 50, 'upload_speed_mbps' => 30 })
      end

      before do
        allow(campaign).to receive(:minimum_download_speed).and_return(10)
        allow(campaign).to receive(:minimum_upload_speed).and_return(5)
      end

      it 'returns true when speeds meet requirements' do
        expect(serialize_with_context(record)['passed']).to be true
      end

      it 'returns false when speeds are below requirements' do
        allow(campaign).to receive(:minimum_download_speed).and_return(100)
        expect(serialize_with_context(record)['passed']).to be false
      end
    end

    context 'with a video record and face_detection_enabled' do
      let(:record) do
        create(:system_check_record, :video,
               system_check_session: system_check_session,
               passed: true,
               data: { 'face_detection_ratio' => 0.9 })
      end

      before do
        allow(campaign).to receive(:face_detection_enabled?).and_return(true)
        allow(campaign).to receive(:minimum_face_detection_ratio).and_return(85)
        allow(campaign).to receive(:phrase_verification_enabled?).and_return(false)
      end

      it 'returns true when face detection ratio meets the minimum' do
        expect(serialize_with_context(record)['passed']).to be true
      end

      it 'returns false when face detection ratio is below the minimum' do
        allow(campaign).to receive(:minimum_face_detection_ratio).and_return(95)
        expect(serialize_with_context(record)['passed']).to be false
      end
    end

    context 'with a video record and both face_detection and phrase_verification enabled' do
      before do
        allow(campaign).to receive(:face_detection_enabled?).and_return(true)
        allow(campaign).to receive(:minimum_face_detection_ratio).and_return(85)
        allow(campaign).to receive(:phrase_verification_enabled?).and_return(true)
      end

      it 'returns true when face detection passes and record passed is true' do
        record = create(:system_check_record, :video,
                        system_check_session: system_check_session,
                        passed: true,
                        data: {
                          'face_detection_ratio' => 0.9,
                          'phrase_verification_status' => 'completed',
                          'phrase_matched' => true
                        })

        expect(serialize_with_context(record)['passed']).to be true
      end

      it 'returns false when face detection passes but phrase verification fails' do
        record = create(:system_check_record, :video,
                        system_check_session: system_check_session,
                        passed: false,
                        data: {
                          'face_detection_ratio' => 0.9,
                          'phrase_verification_status' => 'completed',
                          'phrase_matched' => false
                        })

        expect(serialize_with_context(record)['passed']).to be false
      end
    end

    context 'with a video record and face_detection disabled' do
      let(:record) do
        create(:system_check_record, :video,
               system_check_session: system_check_session,
               passed: true)
      end

      before do
        allow(campaign).to receive(:face_detection_enabled?).and_return(false)
      end

      it 'returns object.passed directly' do
        expect(serialize_with_context(record)['passed']).to be true
      end
    end

    context 'without campaign_user in context' do
      let(:record) do
        create(:system_check_record, :browser,
               system_check_session: system_check_session,
               passed: true)
      end

      it 'returns object.passed directly' do
        expect(described_class.new.serialize(record)['passed']).to be true
      end
    end
  end
end
