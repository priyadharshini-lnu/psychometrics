# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Microsite::AnswerConverters::TfGrid do
  let(:question) { instance_double(Question, id: 123) }

  describe '.build_answers' do
    context 'with all answered (true/false)' do
      it 'converts to MatrixTable format with scale/choice/value' do
        result = {
          'kind' => 'tf_grid',
          'choices' => { 's1' => 'true', 's2' => 'false', 's3' => 'true' }
        }
        response = described_class.build_answers(result, question)

        expect(response['answers']).to contain_exactly(
          { 'scale' => 0, 'choice' => 0, 'value' => true },  # s1 = true
          { 'scale' => 1, 'choice' => 1, 'value' => true },  # s2 = false
          { 'scale' => 0, 'choice' => 2, 'value' => true }   # s3 = true
        )
        expect(response['not_applicable']).to eq({})
      end

      it 'extracts choice index from statement ID regardless of hash order' do
        # Simulate out-of-order hash keys (s3 first, then s1, then s2)
        result = {
          'kind' => 'tf_grid',
          'choices' => { 's3' => 'true', 's1' => 'false', 's2' => 'true' }
        }
        response = described_class.build_answers(result, question)

        # Should correctly map: s1→0, s2→1, s3→2 regardless of hash key order
        expect(response['answers']).to contain_exactly(
          { 'scale' => 1, 'choice' => 0, 'value' => true },  # s1 = false
          { 'scale' => 0, 'choice' => 1, 'value' => true },  # s2 = true
          { 'scale' => 0, 'choice' => 2, 'value' => true }   # s3 = true
        )
      end
    end

    context 'with unknown/Cannot Say responses' do
      it 'marks unknown choices as not_applicable' do
        result = {
          'kind' => 'tf_grid',
          'choices' => { 's1' => 'true', 's2' => 'unknown', 's3' => 'false' }
        }
        response = described_class.build_answers(result, question)

        expect(response['answers']).to contain_exactly(
          { 'scale' => 0, 'choice' => 0, 'value' => true },  # s1 = true
          { 'scale' => 1, 'choice' => 2, 'value' => true }   # s3 = false
        )
        expect(response['not_applicable']).to eq({ '1' => true }) # s2 is not applicable
      end

      it 'handles all unknown responses' do
        result = {
          'kind' => 'tf_grid',
          'choices' => { 's1' => 'unknown', 's2' => 'unknown' }
        }
        response = described_class.build_answers(result, question)

        expect(response['answers']).to eq([])
        expect(response['not_applicable']).to eq({ '0' => true, '1' => true })
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
          { 'scale' => 0, 'choice' => 0, 'value' => true },
          { 'scale' => 1, 'choice' => 1, 'value' => true },
          { 'scale' => 0, 'choice' => 3, 'value' => true },
          { 'scale' => 1, 'choice' => 4, 'value' => true }
        )
        expect(response['not_applicable']).to eq({ '2' => true })
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

  describe 'scale constants' do
    it 'has TRUE_SCALE as 0' do
      expect(described_class::TRUE_SCALE).to eq(0)
    end

    it 'has FALSE_SCALE as 1' do
      expect(described_class::FALSE_SCALE).to eq(1)
    end
  end
end
