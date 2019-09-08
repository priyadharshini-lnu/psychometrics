# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Scoring::TextEntry do
  let!(:text_entry) { Scoring::TextEntry.new }
  let!(:template_data) { [{ 'index' => 'ruby', 'value' => 5 }, { 'index' => 'react', 'value' => 1 }] }

  describe '#calculate' do
    context 'when scoring set from template_data (see template_data)' do
      context 'when answer: ruby' do
        it 'returns 5' do
          result = text_entry.calculate(Question.new, { 'answers' => [{ 'value' => 'ruby' }] }, template_data)[:value]
          expect(result).to eq(5)
        end
      end
      context 'when answer: java' do
        it 'returns nil' do
          result = text_entry.calculate(Question.new, { 'answers' => [{ 'value' => 'java' }] }, template_data)[:value]
          expect(result).to be_nil
        end
      end
      context 'when no answer' do
        it 'returns nil' do
          result = text_entry.calculate(Question.new, { 'answers' => [{ 'value' => '' }] }, template_data)[:value]
          expect(result).to be_nil
        end
      end
    end
  end
end
