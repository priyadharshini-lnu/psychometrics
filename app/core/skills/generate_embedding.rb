# frozen_string_literal: true

module Skills
  class GenerateEmbedding < BaseCommand
    # Maximum batch size for OpenAI embedding API
    # Based on OpenAI limitations:
    # - Input array can be 2048 of size maximum
    # - Single request must be 300k tokens maximum
    #
    # OCI limitations:
    # - A maximum of 96 inputs are allowed for each run.
    # - For the text and image models, you can have files and inputs that all add up to 128,000 tokens.
    #
    # Considering 1 skill will have content like:
    # "Name: Strategic Thinker. Description: A strategic thinker excels at analyzing complex problems,
    # anticipating future challenges, and creating effective long-term plans. They balance short-term
    # needs with overarching goals, make informed decisions, and communicate a clear vision to inspire
    # and guide others.. Type: Behavioral"
    # Maximum words allowed VectorEmbedding::EMBEDDING_TEXT_MAX_WORDS = 300
    # Maximum Token: ~400
    # OpenAI: 400 Token / Skill, 300000 / 400 = 750 Skills per request (Using 700 to be safe)
    # OCI:    400 Token / Skill, 128000 / 400 = 320 Skills per request (Using 96 as max allowed)
    #

    MAX_BATCH_SIZE = 700
    PROVIDER_BATCH_SIZE = {
      'openai' => 700,
      'oci' => 96
    }.freeze

    private_attr_reader :job_record, :skills_query

    def initialize(skills_query, job_record = nil)
      @skills_query = skills_query
      @job_record = job_record
    end

    def call
      job_record&.update!(status: :in_progress, total_tasks: total_tasks)

      skills_query.find_in_batches(batch_size: batch_size) do |batch|
        result = process_batch(batch)

        return broadcast(:error, result[:error]) if result[:error]

        broadcast(:update, result)
      end

      broadcast :ok
    end

    private

    def process_batch(skills_batch)
      embedding_texts = skills_batch.map(&:embedding_text)

      embedding_service = AI::EmbeddingService.new(embedding_texts)

      result = {}
      embedding_service.
        on(:ok) do |vectors|
          skills_batch.each_with_index do |skill, index|
            skill.update_embedding!(vectors[index])
          end

          job_record&.increment_completed_tasks!

          result = { success: true, size: skills_batch.size }
        end.
        on(:error) do |error_message|
          Rails.logger.error("Failed to generate embeddings for batch: #{error_message}")
          result = { error: error_message }
        end.
        call

      result
    end

    def batch_size
      PROVIDER_BATCH_SIZE[provider] || MAX_BATCH_SIZE
    end

    def provider
      @provider ||= Settings.ai_embedding_provider[:provider]
    end

    def total_tasks
      @skills_count ||= skills_query.count
      @total_tasks ||= (@skills_count.to_f / batch_size).ceil
    end
  end
end
