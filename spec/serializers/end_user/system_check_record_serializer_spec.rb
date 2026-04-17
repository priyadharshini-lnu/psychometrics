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
end
