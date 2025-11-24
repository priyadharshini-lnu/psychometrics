# frozen_string_literal: true

require 'rails_helper'

RSpec.describe VectorEmbeddable, type: :model do
  with_model :TestModel do
    table do |t|
      t.string :name
      t.text :description
      t.timestamps
    end

    model do
      include VectorEmbeddable

      def embedding_text
        parts = []
        parts << "Name: #{name}" if name.present?
        parts << "Description: #{description}" if description.present?
        parts.join('. ')
      end

      private

      def embedding_text_previously_changed?
        saved_change_to_name? || saved_change_to_description? || saved_change_to_id?
      end
    end
  end

  let(:embedding_vector) { Array.new(VectorEmbedding::DEFAULT_EMBEDDING_DIMENSIONS, 0.1) }

  before do
    stub_wisper_publisher('AI::EmbeddingService', :call, :ok, [embedding_vector])
  end

  describe 'associations' do
    it { expect(TestModel.new).to have_one(:vector_embedding).dependent(:destroy) }
  end

  describe 'callbacks' do
    it 'schedules embedding generation job after save when embedding text changes' do
      expect(VectorEmbeddingGenerationJob).to receive(:perform_later)

      TestModel.create!(name: 'Test Name', description: 'Test Description')
    end

    it 'schedules embedding generation job when name changes' do
      test_model = TestModel.create!(name: 'Original Name', description: 'Test Description')

      expect(VectorEmbeddingGenerationJob).to receive(:perform_later).with(test_model)

      test_model.update!(name: 'Updated Name')
    end

    it 'schedules embedding generation job when description changes' do
      test_model = TestModel.create!(name: 'Test Name', description: 'Original Description')

      expect(VectorEmbeddingGenerationJob).to receive(:perform_later).with(test_model)

      test_model.update!(description: 'Updated Description')
    end

    it 'does not schedule job when non-embedding fields change' do
      test_model = TestModel.create!(name: 'Test Name', description: 'Test Description')

      expect(VectorEmbeddingGenerationJob).not_to receive(:perform_later)

      test_model.update!(updated_at: 1.day.from_now)
    end

    it 'does not schedule job when skip_embedding_generation is set' do
      expect(VectorEmbeddingGenerationJob).not_to receive(:perform_later)

      test_model = TestModel.new(name: 'Test Name', description: 'Test Description')
      test_model.skip_embedding_generation!
      test_model.save!
    end
  end

  describe '#generate_embedding_async' do
    let(:test_model) { TestModel.create!(name: 'Test Name') }

    it 'schedules VectorEmbeddingGenerationJob' do
      expect(VectorEmbeddingGenerationJob).to receive(:perform_later).with(test_model)

      test_model.generate_embedding_async
    end

    it 'does not schedule job when skip_embedding_generation is set' do
      test_model.skip_embedding_generation!

      expect(VectorEmbeddingGenerationJob).not_to receive(:perform_later)

      test_model.generate_embedding_async
    end
  end

  describe '#generate_embedding!' do
    let(:test_model) { TestModel.create!(name: 'Test Name', description: 'Test Description') }

    it 'creates vector embedding when successful' do
      test_model.generate_embedding!

      expect(test_model.vector_embedding).to be_present
      expect(test_model.embedding).to eq(embedding_vector)
    end

    it 'uses trimmed embedding text for generation' do
      expect(test_model).to receive(:trimmed_embedding_text).and_return('trimmed text')
      expect(AI::EmbeddingService).to receive(:new).with(['trimmed text']).and_call_original

      test_model.generate_embedding!
    end

    it 'does not create embedding when skip_embedding_generation is set' do
      test_model.skip_embedding_generation!

      expect(AI::EmbeddingService).not_to receive(:new)

      test_model.generate_embedding!
    end
  end

  describe '#update_embedding!' do
    let(:test_model) { TestModel.create!(name: 'Test Name') }
    let(:new_vector) { Array.new(VectorEmbedding::DEFAULT_EMBEDDING_DIMENSIONS, 0.5) }

    it 'creates or updates vector embedding' do
      expect(VectorEmbedding).to receive(:create_or_update_for_resource).with(test_model, new_vector)

      test_model.update_embedding!(new_vector)
    end
  end

  describe '#trimmed_embedding_text' do
    let(:test_model) { TestModel.create!(name: 'Test Name', description: 'Test Description') }

    context 'when embedding text is within word limit' do
      it 'returns the full embedding text' do
        original_text = test_model.embedding_text

        expect(test_model.send(:trimmed_embedding_text)).to eq(original_text)
      end
    end

    context 'when embedding text exceeds word limit' do
      let(:long_description) do
        # Create description with EMBEDDING_TEXT_MAX_WORDS + 30 words
        Array.new(VectorEmbeddable::EMBEDDING_TEXT_MAX_WORDS + 30) { |i| "word#{i}" }.join(' ')
      end
      let(:test_model) { TestModel.create!(name: 'Test Name', description: long_description) }

      it 'trims to exactly EMBEDDING_TEXT_MAX_WORDS words' do
        result = test_model.send(:trimmed_embedding_text)
        word_count = result.split.length

        expect(word_count).to eq(VectorEmbeddable::EMBEDDING_TEXT_MAX_WORDS)
      end
    end
  end

  describe 'method requirements' do
    with_model :ModelWithoutEmbeddingText do
      table do |t|
        t.string :name
        t.timestamps
      end

      model do
        include VectorEmbeddable
        # Intentionally not implementing embedding_text
      end
    end

    with_model :ModelWithoutEmbeddingTextChanged do
      table do |t|
        t.string :name
        t.timestamps
      end

      model do
        include VectorEmbeddable

        def embedding_text
          'test text'
        end
        # Intentionally not implementing embedding_text_previously_changed?
      end
    end

    describe '#embedding_text' do
      it 'raises NotImplementedError if not implemented' do
        model = ModelWithoutEmbeddingText.new

        expect do
          model.send(:embedding_text)
        end.to raise_error(NotImplementedError,
                           /ModelWithoutEmbeddingText must implement #embedding_text method/)
      end
    end

    describe '#embedding_text_previously_changed?' do
      it 'raises NotImplementedError if not implemented' do
        model = ModelWithoutEmbeddingTextChanged.new

        expect do
          model.send(:embedding_text_previously_changed?)
        end.
          to raise_error(
            NotImplementedError,
            /ModelWithoutEmbeddingTextChanged must implement #embedding_text_previously_changed\? method/
          )
      end
    end
  end
end
