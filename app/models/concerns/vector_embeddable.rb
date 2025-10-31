# frozen_string_literal: true

module VectorEmbeddable
  extend ActiveSupport::Concern

  EMBEDDING_TEXT_MAX_WORDS = 300

  included do
    has_one :vector_embedding, as: :resource, dependent: :destroy

    delegate :embedding, to: :vector_embedding, allow_nil: true

    after_save :generate_embedding_async, if: :embedding_text_previously_changed?

    scope :without_embeddings, -> { where.missing(:vector_embedding) }
    scope :with_embeddings, -> { where.associated(:vector_embedding) }
    scope :nearest_neighbors, lambda { |embedding_vector, **options|
      joins(:vector_embedding).
        merge(VectorEmbedding.nearest_neighbors(:embedding, embedding_vector, **options)).
        select("#{table_name}.*")
    }

    attr_reader :skip_embedding_generation
  end

  def skip_embedding_generation!
    @skip_embedding_generation = true
    self
  end

  def update_embedding!(vector)
    VectorEmbedding.create_or_update_for_resource(self, vector)
  end

  def generate_embedding_async
    return if skip_embedding_generation

    VectorEmbeddingGenerationJob.perform_later(self)
  end

  def generate_embedding!
    return if skip_embedding_generation

    embedding_service = AI::EmbeddingService.new([trimmed_embedding_text])
    embedding_service.on(:ok) do |vectors|
      update_embedding!(vectors[0])
    end.
      on(:error) do |error_message|
      Rails.logger.error("Failed to generate embedding for #{self.class.name} #{id}: #{error_message}")
      raise ::AI::EmbeddingService::Error, error_message
    end.
      call
  end

  private

  def trimmed_embedding_text
    text = embedding_text
    return text if text.blank?

    words = text.split
    words.first(EMBEDDING_TEXT_MAX_WORDS).join(' ')
  end

  def embedding_text
    raise NotImplementedError, "#{self.class.name} must implement #embedding_text method"
  end

  def embedding_text_previously_changed?
    raise NotImplementedError, "#{self.class.name} must implement #embedding_text_previously_changed? method"
  end
end
