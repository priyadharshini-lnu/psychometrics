# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Question, type: :model do
  context 'Question center methods' do
    it 'dup_for_assessment' do # rubocop:disable Lint/EmptyBlock
    end
  end

  describe '.filterable_fields' do
    let!(:name_match_question) do
      create(
        :question,
        name: 'Leadership readiness question',
        props: {
          questionText: 'Default text',
          type: 'SingleAnswer'
        }
      )
    end

    let!(:text_match_question) do
      create(
        :question,
        name: 'Different name',
        props: {
          questionText: '<p>What motivates your team daily?</p>',
          type: 'SingleAnswer'
        }
      )
    end

    let!(:non_match_question) do
      create(
        :question,
        name: 'Technical depth question',
        props: {
          questionText: 'Completely unrelated text',
          type: 'SingleAnswer'
        }
      )
    end

    it 'returns matches by question name' do
      results = described_class.filterable_fields('leadership')

      expect(results).to include(name_match_question)
      expect(results).not_to include(non_match_question)
    end

    it 'returns matches by question text in props' do
      results = described_class.filterable_fields('motivates your team')

      expect(results).to include(text_match_question)
      expect(results).not_to include(non_match_question)
    end

    it 'is case-insensitive' do
      results = described_class.filterable_fields('MOTIVATES YOUR TEAM')

      expect(results).to include(text_match_question)
    end
  end

  describe '.not_deleted' do
    let!(:active_question) { create(:question, deleted_at: nil) }
    let!(:deleted_question) { create(:question, deleted_at: 1.day.ago) }

    it 'returns only questions with deleted_at as null' do
      results = described_class.not_deleted

      expect(results).to include(active_question)
      expect(results).not_to include(deleted_question)
    end
  end
end
