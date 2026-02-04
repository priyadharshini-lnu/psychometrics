# frozen_string_literal: true

require 'rails_helper'

describe Mhs::GenerateThumbprint do
  let(:source_id) { 'test-source-id-1234-5678-9abc-def012345678' }
  let(:interpret_as) { 'test-form-id-abcd-efgh-ijkl-mnop12345678' }
  let(:observation_items) { 'John|Doe|12345' }

  subject { described_class.new(source_id, interpret_as, observation_items) }

  describe '#call' do
    context 'when observation items are present' do
      it 'generates a 32-character hex string' do
        result = subject.call

        expect(result).to be_a(String)
        expect(result.length).to eq(32)
        expect(result).to match(/\A[a-f0-9]{32}\z/)
      end

      it 'generates consistent thumbprint for same input' do
        result1 = subject.call
        result2 = described_class.new(source_id, interpret_as, observation_items).call

        expect(result1).to eq(result2)
      end

      it 'generates different thumbprint for different source_id' do
        result1 = subject.call
        result2 = described_class.new('different-source-id', interpret_as, observation_items).call

        expect(result1).not_to eq(result2)
      end

      it 'generates different thumbprint for different interpret_as' do
        result1 = subject.call
        result2 = described_class.new(source_id, 'different-interpret-as', observation_items).call

        expect(result1).not_to eq(result2)
      end

      it 'generates different thumbprint for different observation_items' do
        result1 = subject.call
        result2 = described_class.new(source_id, interpret_as, 'Jane|Smith|67890').call

        expect(result1).not_to eq(result2)
      end

      it 'broadcasts :ok with the result' do
        expect(subject).to receive(:broadcast).with(:ok, kind_of(String))
        subject.call
      end
    end

    context 'when observation items are blank' do
      let(:observation_items) { '' }

      it 'returns empty string' do
        result = subject.call
        expect(result).to eq('')
      end
    end

    context 'when observation items are nil' do
      let(:observation_items) { nil }

      it 'returns empty string' do
        result = subject.call
        expect(result).to eq('')
      end
    end

    context 'when an error occurs during hashing' do
      before do
        allow(Digest::MD5).to receive(:hexdigest).and_raise(StandardError.new('Hashing failed'))
      end

      it 'broadcasts :error and returns empty string' do
        expect(subject).to receive(:broadcast).with(:error, 'Hashing failed')
        result = subject.call
        expect(result).to eq('')
      end
    end
  end

  describe 'real thumbprint calculation' do
    context 'with example test data' do
      let(:source_id) { 'test-assessment-id-1234-5678-9abc-def012345678' }
      let(:interpret_as) { 'test-measure-id-abcd-efgh-ijkl-mnop12345678' }
      let(:observation_items) do
        '0|0|1|-1|1|0|1|0|0|-1|1|0|1|0|0|1|1|-1|1|1|0|1|1|0|0|1|-1|1|1|0|0|-1|0|-1|-1|1|1|1|0|0|-1|-1|0|-1|-1|0|0|0|0'
      end

      it 'generates MD5 hash of concatenated data' do
        expected_data = source_id + interpret_as + observation_items
        expected_hash = Digest::MD5.hexdigest(expected_data)

        result = subject.call

        expect(result).to eq(expected_hash)
      end
    end

    context 'with demographics data' do
      let(:source_id) { 'test-gatherer-id-1234-5678-9abc-def012345678' }
      let(:interpret_as) { 'test-demographics-form-id-abcd-efgh-ijkl' }
      let(:observation_items) { 'TestUser|LastName||25|42|' }

      it 'generates expected thumbprint for demographics example' do
        expected_data = source_id + interpret_as + observation_items
        expected_hash = Digest::MD5.hexdigest(expected_data)

        result = subject.call

        expect(result).to eq(expected_hash)
        expect(result).to be_a(String)
        expect(result.length).to eq(32)
      end
    end
  end
end
