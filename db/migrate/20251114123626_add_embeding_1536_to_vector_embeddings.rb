# frozen_string_literal: true

class AddEmbeding1536ToVectorEmbeddings < ActiveRecord::Migration[8.0]
  def change
    add_column :vector_embeddings, :embedding1536, :vector, limit: 1536
    add_index :vector_embeddings, :embedding1536, using: :hnsw, opclass: :vector_cosine_ops
  end
end
