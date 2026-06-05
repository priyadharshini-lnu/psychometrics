# frozen_string_literal: true

require 'rails_helper'

describe Microsite::AnswerConverters::Form do
  describe '.build_answers' do
    let(:microsite_question) do
      {
        'kind' => 'form',
        'fields' => [
          { 'id' => 'gender', 'label' => 'Gender', 'control' => 'select' },
          { 'id' => 'ageRange', 'label' => 'Age Range', 'control' => 'select' },
          { 'id' => 'title', 'label' => 'Title', 'control' => 'input' },
          { 'id' => 'department', 'label' => 'Department', 'control' => 'input' },
          { 'id' => 'governmentEntity', 'label' => 'Government Entity', 'control' => 'input' },
          { 'id' => 'qualification', 'label' => 'Qualification', 'control' => 'select' },
          { 'id' => 'major', 'label' => 'Major', 'control' => 'input' }
        ]
      }
    end

    let(:result) do
      {
        'kind' => 'form',
        'values' => {
          'gender' => 'male',
          'ageRange' => '18-24',
          'title' => 'SWE',
          'department' => 'DGE',
          'governmentEntity' => 'GE',
          'qualification' => '4',
          'major' => 'Btech'
        }
      }
    end

    it 'converts form values to indexed answer format' do
      answers = described_class.build_answers(result, nil, microsite_question)

      expect(answers).to eq([
        { 'index' => 0, 'value' => 'male' },
        { 'index' => 1, 'value' => '18-24' },
        { 'index' => 2, 'value' => 'SWE' },
        { 'index' => 3, 'value' => 'DGE' },
        { 'index' => 4, 'value' => 'GE' },
        { 'index' => 5, 'value' => '4' },
        { 'index' => 6, 'value' => 'Btech' }
      ])
    end

    context 'when some fields are not answered' do
      let(:result) do
        {
          'kind' => 'form',
          'values' => {
            'gender' => 'female',
            'title' => 'Manager'
          }
        }
      end

      it 'only includes answered fields with correct indices' do
        answers = described_class.build_answers(result, nil, microsite_question)

        expect(answers).to eq([
          { 'index' => 0, 'value' => 'female' },
          { 'index' => 2, 'value' => 'Manager' }
        ])
      end
    end

    context 'when values is blank' do
      let(:result) { { 'kind' => 'form', 'values' => {} } }

      it 'returns nil' do
        expect(described_class.build_answers(result, nil, microsite_question)).to be_nil
      end
    end

    context 'when values is missing' do
      let(:result) { { 'kind' => 'form' } }

      it 'returns nil' do
        expect(described_class.build_answers(result, nil, microsite_question)).to be_nil
      end
    end

    context 'when microsite_question is nil' do
      it 'returns nil' do
        expect(described_class.build_answers(result, nil, nil)).to be_nil
      end
    end

    context 'when microsite_question has no fields' do
      let(:microsite_question) { { 'kind' => 'form' } }

      it 'returns nil' do
        expect(described_class.build_answers(result, nil, microsite_question)).to be_nil
      end
    end
  end
end
