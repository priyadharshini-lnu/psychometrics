# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Microsite::AnswerConverters::Base do
  describe '.option_value_to_index' do
    context 'with numeric value' do
      it 'returns the numeric value as integer' do
        expect(described_class.option_value_to_index(5)).to eq(5)
        expect(described_class.option_value_to_index(0)).to eq(0)
      end
    end

    context 'with single letter (a, b, c, ...)' do
      it 'converts a to 0' do
        expect(described_class.option_value_to_index('a')).to eq(0)
      end

      it 'converts b to 1' do
        expect(described_class.option_value_to_index('b')).to eq(1)
      end

      it 'converts d to 3' do
        expect(described_class.option_value_to_index('d')).to eq(3)
      end

      it 'handles uppercase letters' do
        expect(described_class.option_value_to_index('C')).to eq(2)
      end
    end

    context 'with o-prefix format (o1, o2, ...)' do
      it 'converts o1 to 0' do
        expect(described_class.option_value_to_index('o1')).to eq(0)
      end

      it 'converts o5 to 4' do
        expect(described_class.option_value_to_index('o5')).to eq(4)
      end
    end

    context 'with opt-prefix format (opt-1, opt-2, ...)' do
      it 'converts opt-1 to 0' do
        expect(described_class.option_value_to_index('opt-1')).to eq(0)
      end

      it 'converts opt-4 to 3' do
        expect(described_class.option_value_to_index('opt-4')).to eq(3)
      end
    end

    context 'with unrecognized format' do
      it 'returns 0' do
        expect(described_class.option_value_to_index('unknown')).to eq(0)
        expect(described_class.option_value_to_index('')).to eq(0)
      end
    end
  end

  describe '.statement_id_to_index' do
    context 'with numeric value' do
      it 'returns the numeric value as integer' do
        expect(described_class.statement_id_to_index(5)).to eq(5)
        expect(described_class.statement_id_to_index(0)).to eq(0)
      end
    end

    context 'with s-prefix format (s1, s2, ...)' do
      it 'converts s1 to 0' do
        expect(described_class.statement_id_to_index('s1')).to eq(0)
      end

      it 'converts s5 to 4' do
        expect(described_class.statement_id_to_index('s5')).to eq(4)
      end

      it 'handles uppercase S' do
        expect(described_class.statement_id_to_index('S3')).to eq(2)
      end
    end

    context 'with statement- prefix format' do
      it 'converts statement-1 to 0' do
        expect(described_class.statement_id_to_index('statement-1')).to eq(0)
      end

      it 'converts statement_2 to 1' do
        expect(described_class.statement_id_to_index('statement_2')).to eq(1)
      end

      it 'converts statement3 to 2' do
        expect(described_class.statement_id_to_index('statement3')).to eq(2)
      end
    end

    context 'with stmt- prefix format' do
      it 'converts stmt-1 to 0' do
        expect(described_class.statement_id_to_index('stmt-1')).to eq(0)
      end

      it 'converts stmt_4 to 3' do
        expect(described_class.statement_id_to_index('stmt_4')).to eq(3)
      end
    end

    context 'with any trailing number (fallback)' do
      it 'extracts trailing number and converts to 0-based index' do
        expect(described_class.statement_id_to_index('choice1')).to eq(0)
        expect(described_class.statement_id_to_index('item-5')).to eq(4)
        expect(described_class.statement_id_to_index('row_10')).to eq(9)
      end
    end

    context 'with no number' do
      it 'returns 0' do
        expect(described_class.statement_id_to_index('unknown')).to eq(0)
        expect(described_class.statement_id_to_index('')).to eq(0)
      end
    end
  end
end
