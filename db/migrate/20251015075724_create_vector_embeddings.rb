# frozen_string_literal: true

class CreateVectorEmbeddings < ActiveRecord::Migration[7.1]
  def change
    create_table :vector_embeddings do |t|
      t.vector :embedding, limit: 512
      t.references :resource, polymorphic: true, null: false
      t.timestamps
    end

    add_index :vector_embeddings, :embedding, using: :hnsw, opclass: :vector_cosine_ops
  end
end
