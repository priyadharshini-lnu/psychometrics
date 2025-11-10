# frozen_string_literal: true

class VectorEmbeddingGenerationJob < ApplicationJob
  def perform(entity)
    entity.generate_embedding!
  end
end
