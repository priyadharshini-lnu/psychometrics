# frozen_string_literal: true

class AddIndexToVectorEmbeddingsEmbeddingColumnIfNotExists < ActiveRecord::Migration[8.0]
  def up
    unless index_exists?(:vector_embeddings, :embedding, using: :hnsw, opclass: :vector_cosine_ops)
      add_index :vector_embeddings, :embedding, using: :hnsw, opclass: :vector_cosine_ops
    end
  end

  def down
    if index_exists?(:vector_embeddings, :embedding, using: :hnsw, opclass: :vector_cosine_ops)
      remove_index :vector_embeddings, :embedding
    end
  end
end
