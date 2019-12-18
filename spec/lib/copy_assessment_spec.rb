# frozen_string_literal: true

require 'rails_helper'

describe CopyAssessment do
  describe '.process!' do
    let(:assessment) { create(:assessment) }
    let(:block) { create(:block, assessment: assessment) }
    let(:factor) { create(:factor) }

    let(:copied_assessment) { double(:assessment) }

    before do
      questions = create_list(:question, 3, block: block)
      create(:translation, translateable: questions.first, resource: assessment)

      create(:factors_scoring, factor: factor, question: questions.first, assessment: assessment)
      create(:question_recoding, question: questions.first, assessment: assessment)

      display_logic = [
        {
          'conditionType': 'Question',
          'type': 'bool',
          'subject': questions[1].id,
          'answer': 0,
          'predicate': 'Selected'
        }
      ]
      skip_logic = [
        {
          'subject': questions.first.id,
          'prefix': 'And',
          'answer': 0,
          'predicate': 'NotSelected',
          'type': 'bool',
          'destination': 'EndOfBlock'
        }
      ]

      questions.first.update_attributes(display_logic: display_logic)
      questions.last.update_attributes(skip_logic: skip_logic)
    end

    let(:copy) { described_class.new.process!(assessment.id) }

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
      question_id = assessment.blocks.first.questions.first.id
      copied_display_logic = copy.blocks.first.questions.first.display_logic.to_json
      pattern = /\"subject\":#{question_id}/

      expect(copied_display_logic.match(pattern)).to be_nil
    end

    it "doesn't copy empty display_logic" do
      og_display_logic = assessment.blocks.first.questions.last.display_logic
      expect(og_display_logic).to be_nil

      co_display_logic = copy.blocks.first.questions.last.display_logic
      expect(co_display_logic).to be_nil
    end

    it 'replaces question_id in skip_logic' do
      question_id = assessment.blocks.first.questions.last.id
      copied_skip_logic = copy.blocks.first.questions.last.skip_logic.to_json
      pattern = /\"subject\":#{question_id}/

      expect(copied_skip_logic.match(pattern)).to be_nil
    end

    it "doesn't copy empty skip_logic" do
      og_skip_logic = assessment.blocks.first.questions.first.skip_logic
      expect(og_skip_logic).to be_nil

      co_skip_logic = copy.blocks.first.questions.first.skip_logic
      expect(co_skip_logic).to be_nil
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
