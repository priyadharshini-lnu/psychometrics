# frozen_string_literal: true

require 'rails_helper'

describe Utility::String do
  describe '.has_repeated_substring?' do
    it do
      expect(
        described_class.has_repeated_substring?('111', max_occurrence: 3, min_substring_length: 1)
      ).to eq(true)
      expect(
        described_class.has_repeated_substring?('111', max_occurrence: 4, min_substring_length: 1)
      ).to eq(false)
      expect(
        described_class.has_repeated_substring?('111', max_occurrence: 3, min_substring_length: 2)
      ).to eq(false)
      expect(
        described_class.has_repeated_substring?('121212', max_occurrence: 3, min_substring_length: 2)
      ).to eq(true)
    end
  end

  describe '.has_sequence?' do
    it 'checks for alphabetical sequence' do
      expect(
        described_class.has_sequence?('abcd', seq_length: 4)
      ).to eq(true)
      expect(
        described_class.has_sequence?('abcd1', seq_length: 5)
      ).to eq(false)
    end

    it 'checks for numeric sequence' do
      expect(
        described_class.has_sequence?('1234', seq_length: 4)
      ).to eq(true)
      expect(
        described_class.has_sequence?('1234abc', seq_length: 5)
      ).to eq(false)
    end

    it 'sequence length is 3 by default' do
      expect(
        described_class.has_sequence?('ab')
      ).to eq(false)
      expect(
        described_class.has_sequence?('abc')
      ).to eq(true)
    end
  end

  describe '.remove_csv_injection_marker' do
    it 'removes the first character if it is a single quote appended with csv injection char' do
      expect(
        described_class.remove_csv_injection_marker("'=abc")
      ).to eq('=abc')
      expect(
        described_class.remove_csv_injection_marker("'+abc")
      ).to eq('+abc')
      expect(
        described_class.remove_csv_injection_marker("'-abc")
      ).to eq('-abc')
      expect(
        described_class.remove_csv_injection_marker("'@abc")
      ).to eq('@abc')
      expect(
        described_class.remove_csv_injection_marker("'\tabc")
      ).to eq("\tabc")
      expect(
        described_class.remove_csv_injection_marker("'\rabc")
      ).to eq("\rabc")
      expect(
        described_class.remove_csv_injection_marker("'%abc")
      ).to eq('%abc')
      expect(
        described_class.remove_csv_injection_marker("'|abc")
      ).to eq('|abc')
    end

    it 'does not remove the first character if it is not a single quote appended with csv injection char' do
      expect(
        described_class.remove_csv_injection_marker("'abc")
      ).to eq("'abc")
      expect(
        described_class.remove_csv_injection_marker('abc=')
      ).to eq('abc=')
    end
  end
end
