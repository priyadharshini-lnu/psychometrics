# frozen_string_literal: true

require 'rails_helper'

RSpec.describe VectorEmbedding, type: :model do
  it { should belong_to(:resource) }

  it { should validate_presence_of(:embedding) }
  it { should validate_presence_of(:resource) }

  describe 'create_or_update_for_resource' do
    let(:skill) { create(:skill) }
    let(:embedding_vector) { Array.new(VectorEmbedding::EMBEDDING_DIMENSIONS, 0.1) }

    context 'when no embedding exists for resource' do
      it 'creates a new vector embedding' do
        expect do
          VectorEmbedding.create_or_update_for_resource(skill, embedding_vector)
        end.to change(VectorEmbedding, :count).by(1)
      end

      it 'returns the created vector embedding' do
        result = VectorEmbedding.create_or_update_for_resource(skill, embedding_vector)

        expect(result).to be_a(VectorEmbedding)
        expect(result.resource).to eq(skill)
        expect(result.embedding).to eq(embedding_vector)
      end
    end

    context 'when embedding already exists for resource' do
      let(:new_embedding_vector) { Array.new(VectorEmbedding::EMBEDDING_DIMENSIONS, 0.2) }

      before do
        VectorEmbedding.create!(resource: skill, embedding: embedding_vector)
      end

      it 'does not create a new vector embedding' do
        expect do
          VectorEmbedding.create_or_update_for_resource(skill, new_embedding_vector)
        end.not_to change(VectorEmbedding, :count)
      end

      it 'updates the existing vector embedding' do
        result = VectorEmbedding.create_or_update_for_resource(skill, new_embedding_vector)

        expect(result.embedding).to eq(new_embedding_vector)
      end
    end
  end
end
