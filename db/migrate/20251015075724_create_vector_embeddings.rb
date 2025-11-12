# frozen_string_literal: true

# Migration has been modified to deal with different pgvector versions for index creation.
class CreateVectorEmbeddings < ActiveRecord::Migration[7.1]
  def change
    create_table :vector_embeddings do |t|
      t.vector :embedding, limit: 512
      t.references :resource, polymorphic: true, null: false
      t.timestamps
    end

    begin
      # HNSW with cosine ops (pgvector >= 0.5.0)
      add_index :vector_embeddings, :embedding, using: :hnsw, opclass: :vector_cosine_ops
    rescue ActiveRecord::StatementInvalid => e
      # rubocop:disable CustomRubocops/AvoidActiveRecordInMigrations
      Rails.logger.warn { "Could not create HNSW index with cosine ops. Error: #{e.message}" }
      # rubocop:enable CustomRubocops/AvoidActiveRecordInMigrations
    end
  end
end
