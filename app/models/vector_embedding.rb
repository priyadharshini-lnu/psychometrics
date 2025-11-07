# frozen_string_literal: true

class VectorEmbedding < ApplicationRecord
  EMBEDDING_DIMENSIONS = 512

  belongs_to :resource, polymorphic: true

  has_neighbors :embedding

  validates :embedding, presence: true
  validates :resource, presence: true

  self.filter_attributes += ['embedding']

  def self.create_or_update_for_resource(resource, embedding_vector)
    vector_embedding = find_or_initialize_by(resource: resource)
    vector_embedding.embedding = embedding_vector
    vector_embedding.save!
    vector_embedding
  end
end
