# frozen_string_literal: true

module Skills
  class GenerateEmbedding < BaseCommand
    # Maximum batch size for OpenAI embedding API
    # Based on OpenAI limitations:
    # - Input array can be 2048 of size maximum
    # - Single request must be 300k tokens maximum
    #
    # Considering 1 skill will have content like:
    # "Name: Strategic Thinker. Description: A strategic thinker excels at analyzing complex problems,
    # anticipating future challenges, and creating effective long-term plans. They balance short-term
    # needs with overarching goals, make informed decisions, and communicate a clear vision to inspire
    # and guide others.. Type: Behavioral"
    # Maximum words allowed VectorEmbedding::EMBEDDING_TEXT_MAX_WORDS = 300
    # Maximum Token: ~400
    # 400 Token / Skill, 300000 / 400 = 750 Skills per request
    # Using 700 to be safe
    MAX_BATCH_SIZE = 700

    private_attr_reader :job_record, :skills_query

    def initialize(skills_query, job_record = nil)
      @skills_query = skills_query
      @job_record = job_record
    end

    def call
      job_record&.update!(status: :in_progress, total_tasks: total_tasks)

      skills_query.find_in_batches(batch_size: MAX_BATCH_SIZE) do |batch|
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

    def total_tasks
      @skills_count ||= skills_query.count
      @total_tasks ||= (@skills_count.to_f / MAX_BATCH_SIZE).ceil
    end
  end
end
