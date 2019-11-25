# frozen_string_literal: true

require 'rails_helper'

describe CopyAssessment do
  describe '.process!' do
    let(:assessment) { create(:assessment) }
    let(:block) { create(:block, assessment: assessment) }
    let(:question) { create(:question, block: block) }
    let(:factor) { create(:factor) }

    let(:copied_assessment) { double(:assessment) }

    before do
      create(:translation, translateable: question, resource: assessment)

      create(:factors_scoring, factor: factor, question: question, assessment: assessment)
      create(:question_recoding, question: question, assessment: assessment)
    end

    let(:copy) { described_class.process!(assessment.id) }

    it 'succeeds' do
      expect(copy).to be_an_instance_of(Assessments::Common)
      expect(copy.persisted?).to be_truthy

      expect(copy.name).to eq(assessment.name + ' (1)')
    end

    it 'copies all blocks' do
      expect(copy.blocks.length).to eq(assessment.blocks.length)
    end

    it 'copies all questions of each block' do
      expect(copy.blocks.first.questions.length).to eq(assessment.blocks.first.questions.length)
    end

    it 'copies translations of questions' do
      expect(
        copy.blocks.first.questions.first.translations.length
      ).to eq(
        assessment.blocks.first.questions.first.translations.length
      )

      translation = copy.blocks.first.questions.first.translations.first

      expect(translation.resource_id).to eq(copy.id)
      expect(translation.translateable_id).to eq(copy.blocks.first.questions.first.id)
    end

    it 'copies factors scorings' do
      original = assessment.blocks.first.questions.first
      copied = copy.blocks.first.questions.first

      expect(original.factors_scorings.length).to eq(1)
      expect(copied.factors_scorings.length).to eq(1)
    end

    it 'copies question recodings' do
      original = assessment.blocks.first.questions.first
      copied = copy.blocks.first.questions.first

      expect(original.question_recodings.length).to eq(1)
      expect(copied.question_recodings.length).to eq(1)
    end

    it 'copies question translations' do
      translations = copy.blocks.first.questions.first.translations

      expect(translations.length).to eq(assessment.blocks.first.questions.first.translations.length)
    end
  end
end
