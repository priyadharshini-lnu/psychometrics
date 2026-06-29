# frozen_string_literal: true

require 'rails_helper'

RSpec.describe SystemCheckRecords::PhraseVerifier do
  let(:target) { 'I am ready this is a test recording to confirm my microphone is working' }

  describe '#call' do
    subject(:result) { described_class.new(target, transcript).call }

    context 'with an exact match' do
      let(:transcript) { target }

      it { expect(result.matched).to be(true) }
      it { expect(result.score).to eq(1.0) }
    end

    context 'with minor ASR substitution (one word wrong)' do
      let(:transcript) { 'I am ready this is a test recoding to confirm my microphone is working' }

      it { expect(result.matched).to be(true) }
    end

    context 'with extra surrounding words in the transcript' do
      let(:transcript) { "okay sure #{target} thank you very much" }

      it { expect(result.matched).to be(true) }
    end

    context 'with punctuation and casing differences' do
      let(:transcript) { 'I Am Ready. This Is A Test Recording To Confirm My Microphone Is Working!' }

      it { expect(result.matched).to be(true) }
    end

    context 'with a completely different phrase' do
      let(:transcript) { 'the weather is nice today I like coffee' }

      it { expect(result.matched).to be(false) }
    end

    context 'with correct words but completely wrong order' do
      let(:transcript) { 'working microphone my confirm to recording test a is this ready am I' }

      it { expect(result.matched).to be(false) }
    end

    context 'with an empty transcript' do
      let(:transcript) { '' }

      it { expect(result.matched).to be(false) }
      it { expect(result.score).to eq(0.0) }
    end

    context 'with an empty target phrase' do
      subject(:result) { described_class.new('', 'some transcript').call }

      it { expect(result.matched).to be(false) }
      it { expect(result.score).to eq(0.0) }
    end

    context 'result fields' do
      let(:transcript) { target }

      it 'populates best_window' do
        expect(result.best_window).to be_a(String).and be_present
      end

      it 'populates details with all sub-scores' do
        expect(result.details).to include(:edit_score, :coverage, :bigram_score, :score)
      end
    end
  end
end
