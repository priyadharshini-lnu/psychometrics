# frozen_string_literal: true

require 'rails_helper'

RSpec.describe SystemCheckRecords::PhraseVerifier do
  let(:target) { 'I am ready this is a test recording to confirm my microphone is working' }
  let(:repeated_target) { [target, target, target].join(' ') }

  describe '#call' do
    subject(:result) { described_class.new(target, transcript).call }

    context 'with an exact match repeated three times' do
      let(:transcript) { repeated_target }

      it { expect(result.matched).to be(true) }
      it { expect(result.score).to eq(1.0) }
    end

    context 'with minor ASR substitutions across repetitions' do
      let(:transcript) do
        [
          target,
          'I am ready this is a test recoding to confirm my microphone is working',
          'I am ready this is a test recording to confirm my microfone is working'
        ].join(' ')
      end

      it { expect(result.matched).to be(true) }
    end

    context 'with extra surrounding words in the transcript' do
      let(:transcript) { "okay sure #{repeated_target} thank you very much" }

      it { expect(result.matched).to be(true) }
    end

    context 'with punctuation and casing differences' do
      let(:transcript) do
        [
          'I Am Ready. This Is A Test Recording To Confirm My Microphone Is Working!',
          'I AM READY THIS IS A TEST RECORDING TO CONFIRM MY MICROPHONE IS WORKING!',
          'i am ready this is a test recording to confirm my microphone is working.'
        ].join(' ')
      end

      it { expect(result.matched).to be(true) }
    end

    context 'with a completely different phrase repeated three times' do
      let(:transcript) { 'the weather is nice today I like coffee' }

      it { expect(result.matched).to be(false) }
    end

    context 'with correct words but completely wrong order across repetitions' do
      let(:transcript) do
        [
          'working microphone my confirm to recording test a is this ready am I',
          'working microphone my confirm to recording test a is this ready am I',
          'working microphone my confirm to recording test a is this ready am I'
        ].join(' ')
      end

      it { expect(result.matched).to be(false) }
    end

    context 'when only one valid phrase occurrence is present' do
      let(:transcript) { target }

      it { expect(result.matched).to be(false) }
      it { expect(result.score).to eq(0.3333) }
    end

    context 'when best single window is strong but average across three windows is weak' do
      let(:unrelated_phrase) do
        'sun moon star cloud river mountain valley ocean forest desert thunder lightning wind rain'
      end
      let(:transcript) { [target, unrelated_phrase, unrelated_phrase].join(' marker ') }

      it 'fails because matching is based on average score, not the best score' do
        expect(result.matched).to be(false)
        expect(result.score).to be < described_class::DEFAULT_THRESHOLD
      end
    end

    context 'when more than three phrase occurrences are present' do
      let(:weak_occurrence) { 'I am ready this is a test' }
      let(:transcript) do
        [
          target,
          'I am ready this is a test recording to confirm my microphone is workin',
          'I am ready this is a test recoding to confirm my microphone is working',
          'I am ready this is a test recording to confirm my microfone is working',
          weak_occurrence
        ].join(' spacer ')
      end

      it 'keeps the best three non-overlapping occurrences' do
        expect(result.matched).to be(true)
        expect(result.score).to be > 0.8
      end
    end

    context 'with an empty transcript' do
      let(:transcript) { '' }

      it { expect(result.matched).to be(false) }
      it { expect(result.score).to eq(0.0) }
      it { expect(result.details[:error]).to eq('Empty target or transcript') }
    end

    context 'with an empty target phrase' do
      subject(:result) { described_class.new('', 'some transcript').call }

      it { expect(result.matched).to be(false) }
      it { expect(result.score).to eq(0.0) }
      it { expect(result.details[:error]).to eq('Empty target or transcript') }
    end

    context 'result fields' do
      let(:transcript) { repeated_target }

      it 'exposes only the public result fields' do
        expect(result.to_h.keys).to contain_exactly(:matched, :score, :details)
      end
    end
  end
end
