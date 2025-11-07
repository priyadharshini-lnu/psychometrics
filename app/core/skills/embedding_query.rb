# frozen_string_literal: true

module Skills
  class EmbeddingQuery < BaseCommand
    private_attr_reader :query_text, :limit, :scoped_skills

    def initialize(scoped_skills, query_text:, limit: 5)
      @scoped_skills = scoped_skills
      @query_text = query_text
      @limit = limit
    end

    def call
      embedding_service = AI::EmbeddingService.new([query_text])

      embedding_service.
        on(:ok) do |embedding_vectors|
          query_embedding = embedding_vectors.first
          result = scoped_skills.nearest_neighbors(query_embedding, distance: :cosine).limit(limit)
          broadcast(:ok, result)
        end.
        on(:error) do |error_message|
          broadcast(:error, error_message)
        end.
        call
    end
  end
end
