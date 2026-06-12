# frozen_string_literal: true

class VectorEmbedding < ApplicationRecord
  DEFAULT_EMBEDDING_DIMENSIONS = 512

  belongs_to :resource, polymorphic: true

  tenant_config has_global_records: true, optional: true
  include Tenantable

  tenant_source :resource

  has_neighbors :embedding
  has_neighbors :embedding1536

  validates :resource, presence: true

  self.filter_attributes += %w[embedding embedding1536]

  def embedding=(embedding_vector)
    if embedding_vector&.size == DEFAULT_EMBEDDING_DIMENSIONS
      super
    elsif embedding_vector&.size
      size = embedding_vector&.size
      self[:"embedding#{size}"] = embedding_vector
    end
  end

  def self.create_or_update_for_resource(resource, embedding_vector)
    vector_embedding = find_or_initialize_by(resource: resource)
    vector_embedding.embedding = embedding_vector
    vector_embedding.save!
    vector_embedding
  end
end
