# frozen_string_literal: true

# Migration has been modified to deal with different pgvector versions for index creation.
# rubocop:disable CustomRubocops/AvoidActiveRecordInMigrations
class CreateVectorEmbeddings < ActiveRecord::Migration[7.1]
  def change
    create_table :vector_embeddings do |t|
      t.vector :embedding, limit: 512
      t.references :resource, polymorphic: true, null: false
      t.timestamps
    end

    # Check pgvector version and create index only if >= 0.5.0
    result = ActiveRecord::Base.connection.execute("SELECT extversion FROM pg_extension WHERE extname = 'vector'")

    version = result.first['extversion']
    Rails.logger.debug { "Detected pgvector version: #{version}" }

    if Gem::Version.new(version) >= Gem::Version.new('0.5.0')
      add_index :vector_embeddings, :embedding, using: :hnsw, opclass: :vector_cosine_ops
    else
      Rails.logger.debug { "Skipping HNSW index creation - pgvector #{version} < 0.5.0 required" }
    end
  end
end
# rubocop:enable CustomRubocops/AvoidActiveRecordInMigrations
