# frozen_string_literal: true

require 'rails_helper'

describe Assessments::QuestionsImport::ProcessedRowForm do
  let(:assessment) { create(:assessment) }
  let(:dimension) { assessment.dimension }

  context 'QuestionField' do
    it 'validate presence of question fields' do
      form = described_class.new(question: { name: nil }).with_context(assessment: assessment)
      form.valid?
      errors = form.errors.full_messages
      expect(errors).to include("Question Name can't be blank")
      expect(errors).to include("Question Title can't be blank")
    end

    it 'validate question type is correct' do
      form = described_class.new(question: { type: 'WrongType' }).with_context(assessment: assessment)
      form.valid?
      errors = form.errors.full_messages
      expect(errors).to include(
        "Question type should be 'TextEntry', 'MultipleChoice', 'MatrixTable', 'StaticContent', 'AudioResponse' or 'VideoResponse'" # rubocop:disable Layout/LineLength
      )
    end
  end

  context 'BlockField' do
    it 'validates presence of block fields' do
      form = described_class.new(block: { name: nil }).with_context(assessment: assessment)
      form.valid?
      errors = form.errors.full_messages
      expect(errors).to include("Block Name can't be blank")
    end
  end

  context 'QuestionPropertyField for TextEntry' do
    it 'validate presence of type' do
      form = described_class.new('question' => { 'type' => 'TextEntry' }, 'question_property' => {}).
             with_context(assessment: assessment)
      form.valid?
      errors = form.errors.full_messages
      expect(errors).to include("TextEntry question property 'type' can't be blank.")
    end

    it 'validate type is correct' do
      form = described_class.new('question' => { 'type' => 'TextEntry' }, 'question_property' => { type: 'WrongType' }).
             with_context(assessment: assessment)
      form.valid?
      errors = form.errors.full_messages
      expect(errors).to include(
        "TextEntry question property 'type' should be 'Single Line', 'Multi Line' or 'Essay Text Box'"
      )
    end
  end

  context 'QuestionPropertyField for MultipleChoice' do
    it 'validate presence of type' do
      form = described_class.new('question' => { 'type' => 'MultipleChoice' }, 'question_property' => {}).
             with_context(assessment: assessment)
      form.valid?
      errors = form.errors.full_messages
      expect(errors).to include("MultipleChoice question property 'type' can't be blank.")
    end

    it 'validate type is correct' do
      form = described_class.new(
        'question' => { 'type' => 'MultipleChoice' }, 'question_property' => { type: 'WrongType' }
      ).with_context(assessment: assessment)
      form.valid?
      errors = form.errors.full_messages
      expect(errors).to include(
        "MultipleChoice question property 'type' should be 'SingleAnswer', 'MultipleAnswer' or 'Dropdown'"
      )
    end
  end

  context 'QuestionPropertyField for MatrixTable' do
    it 'validate presence of type' do
      form = described_class.new('question' => { 'type' => 'MatrixTable' }, 'question_property' => {}).
             with_context(assessment: assessment)
      form.valid?
      errors = form.errors.full_messages
      expect(errors).to include("MatrixTable question property 'type' can't be blank")
    end

    it 'validate type is correct' do
      form = described_class.new(
        'question' => { 'type' => 'MatrixTable' }, 'question_property' => { type: 'WrongType' }
      ).with_context(assessment: assessment)
      form.valid?
      errors = form.errors.full_messages
      expect(errors).to include(
        "MatrixTable question type should have 'Likert'"
      )
    end

    it 'validate presence of answersType' do
      form = described_class.new(
        'question' => { 'type' => 'MatrixTable' }, 'question_property' => {}
      ).with_context(assessment: assessment)
      form.valid?
      errors = form.errors.full_messages
      expect(errors).to include("MatrixTable question property 'answersType' can't be blank")
    end

    it 'validate answersType is correct' do
      form = described_class.new(
        'question' => { 'type' => 'MatrixTable' }, 'question_property' => { answersType: 'WrongType' }
      ).with_context(assessment: assessment)
      form.valid?
      errors = form.errors.full_messages
      expect(errors).to include(
        "MatrixTable question property 'answerType' should be 'SingleAnswer' or 'MultipleAnswer'"
      )
    end
  end

  context 'QuestionPropertyField for StaticContent' do
    it 'validate presence of type' do
      form = described_class.new('question' => { 'type' => 'StaticContent' }, 'question_property' => {}).
             with_context(assessment: assessment)
      form.valid?
      errors = form.errors.full_messages
      expect(errors).to include("Static Content question property type can't be blank")
    end

    it 'validate type is correct' do
      form = described_class.new(
        'question' => { 'type' => 'StaticContent' }, 'question_property' => { type: 'WrongType' }
      ).with_context(assessment: assessment)
      form.valid?
      errors = form.errors.full_messages
      expect(errors).to include("Static Content  question property type should be 'Text'")
    end
  end

  context 'Scoring' do
    it 'validate scores are added for only allowed types' do
      form = described_class.new('question' => { 'type' => 'TextEntry' }, 'scoring' => { 'Accountability' => '1' }).
             with_context(assessment: assessment)
      form.valid?
      errors = form.errors.full_messages
      expect(errors).to include("TextEntry question property 'type' can't be blank.")
    end

    it 'validates scores are added in validate format' do
      dimension.factors.create(name: 'Accountability')
      form = described_class.new(
        'question' => { 'type' => 'MultipleChoice' },
        'scoring' => { 'Accountability' => '1,a' }
      ).with_context(assessment: assessment, allowed_factor_names: ['Accountability'])
      form.valid?
      errors = form.errors.full_messages
      expect(errors).to include(
        'Scores for factor Accountability are invalid. Scores should be comma separated numeric values'
      )
    end

    it 'validate presence of factor in dimension' do
      form = described_class.new(
        'question' => { 'type' => 'MultipleChoice' },
        'scoring' => { 'Accountability' => '1,2', 'Grit' => '1,2', 'Team work' => '1, 3' }
      ).with_context(assessment: assessment, allowed_factor_names: ['Team work'])
      form.valid?
      errors = form.errors.full_messages
      expect(errors).to include(
        "'Accountability' and 'Grit' factors are not present in a dimension"
      )
    end
  end
end
