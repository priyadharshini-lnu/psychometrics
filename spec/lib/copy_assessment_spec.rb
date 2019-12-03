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

      display_logic = [
        { 'conditionType': 'Question', 'type': 'bool', 'subject': question.id, 'answer': 0,'predicate': 'Selected' }
      ]
      skip_logic = [
        {
          'subject': question.id,
          'prefix': 'And',
          'answer': 0,
          'predicate': 'NotSelected',
          'type': 'bool',
          'destination': 'EndOfBlock'
        }
      ]

      question.update_attributes(display_logic: display_logic, skip_logic: skip_logic)
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

    it 'replaces question_id in display_logic' do
      copied_question_id = copy.blocks.first.questions.first.id
      display_logic = (copy.blocks.first.questions.first.display_logic || {}).to_json
      pattern = /\"subject\":#{copied_question_id}/

      expect(display_logic.match(pattern)).not_to be_nil
    end

    it 'replaces question_id in skip_logic' do
      copied_question_id = copy.blocks.first.questions.first.id
      skip_logic = (copy.blocks.first.questions.first.skip_logic || {}).to_json
      pattern = /\"subject\":#{copied_question_id}/

      expect(skip_logic.match(pattern)).not_to be_nil
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
