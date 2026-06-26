# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Microsite::AnswerConverters::TfGrid do
  let(:question) { instance_double(Question, id: 123) }

  describe '.build_answers' do
    context 'with all answered (true/false)' do
      it 'converts to MatrixTable format with scale/choice/value/recode_value' do
        result = {
          'kind' => 'tf_grid',
          'choices' => { 's1' => 'true', 's2' => 'false', 's3' => 'true' }
        }
        response = described_class.build_answers(result, question)

        expect(response['answers']).to contain_exactly(
          { 'scale' => 0, 'value' => true, 'choice' => 0, 'recode_value' => 1 },  # s1 = true
          { 'scale' => 1, 'value' => true, 'choice' => 1, 'recode_value' => 2 },  # s2 = false
          { 'scale' => 0, 'value' => true, 'choice' => 2, 'recode_value' => 1 }   # s3 = true
        )
        expect(response['not_applicable']).to be_nil
      end

      it 'extracts choice index from statement ID regardless of hash order' do
        result = {
          'kind' => 'tf_grid',
          'choices' => { 's3' => 'true', 's1' => 'false', 's2' => 'true' }
        }
        response = described_class.build_answers(result, question)

        expect(response['answers']).to contain_exactly(
          { 'scale' => 1, 'value' => true, 'choice' => 0, 'recode_value' => 2 },  # s1 = false
          { 'scale' => 0, 'value' => true, 'choice' => 1, 'recode_value' => 1 },  # s2 = true
          { 'scale' => 0, 'value' => true, 'choice' => 2, 'recode_value' => 1 }   # s3 = true
        )
      end
    end

    context 'with unknown/Cannot Say responses' do
      it 'includes unknown responses with scale 2 and recode_value 3' do
        result = {
          'kind' => 'tf_grid',
          'choices' => { 's1' => 'true', 's2' => 'unknown', 's3' => 'false' }
        }
        response = described_class.build_answers(result, question)

        expect(response['answers']).to contain_exactly(
          { 'scale' => 0, 'value' => true, 'choice' => 0, 'recode_value' => 1 },  # s1 = true
          { 'scale' => 2, 'value' => true, 'choice' => 1, 'recode_value' => 3 },  # s2 = unknown
          { 'scale' => 1, 'value' => true, 'choice' => 2, 'recode_value' => 2 }   # s3 = false
        )
        expect(response['not_applicable']).to be_nil
      end

      it 'handles all unknown responses' do
        result = {
          'kind' => 'tf_grid',
          'choices' => { 's1' => 'unknown', 's2' => 'unknown' }
        }
        response = described_class.build_answers(result, question)

        expect(response['answers']).to contain_exactly(
          { 'scale' => 2, 'value' => true, 'choice' => 0, 'recode_value' => 3 },
          { 'scale' => 2, 'value' => true, 'choice' => 1, 'recode_value' => 3 }
        )
        expect(response['not_applicable']).to be_nil
      end
    end

    context 'with mixed responses' do
      it 'handles realistic scenario' do
        result = {
          'kind' => 'tf_grid',
          'choices' => {
            's1' => 'true',
            's2' => 'false',
            's3' => 'unknown',
            's4' => 'true',
            's5' => 'false'
          }
        }
        response = described_class.build_answers(result, question)

        expect(response['answers']).to contain_exactly(
          { 'scale' => 0, 'value' => true, 'choice' => 0, 'recode_value' => 1 },
          { 'scale' => 1, 'value' => true, 'choice' => 1, 'recode_value' => 2 },
          { 'scale' => 2, 'value' => true, 'choice' => 2, 'recode_value' => 3 },
          { 'scale' => 0, 'value' => true, 'choice' => 3, 'recode_value' => 1 },
          { 'scale' => 1, 'value' => true, 'choice' => 4, 'recode_value' => 2 }
        )
        expect(response['not_applicable']).to be_nil
      end
    end

    context 'with empty choices' do
      it 'returns nil for empty hash' do
        result = { 'kind' => 'tf_grid', 'choices' => {} }
        expect(described_class.build_answers(result, question)).to be_nil
      end

      it 'returns nil for nil' do
        result = { 'kind' => 'tf_grid', 'choices' => nil }
        expect(described_class.build_answers(result, question)).to be_nil
      end
    end
  end

  describe 'constants' do
    it 'has correct SCALE_VALUES mapping' do
      expect(described_class::SCALE_VALUES).to eq('true' => 0, 'false' => 1, 'unknown' => 2)
    end

    it 'has correct RECODE_VALUES mapping' do
      expect(described_class::RECODE_VALUES).to eq('true' => 1, 'false' => 2, 'unknown' => 3)
    end
  end
end
