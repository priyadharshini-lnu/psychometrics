# frozen_string_literal: true

namespace :skills do
  namespace :embeddings do
    desc 'Generate embeddings for skills (use IGNORE_EXISTING=true to regenerate all)'
    task :generate => :environment do
      ignore_existing = ENV['IGNORE_EXISTING'] == 'true'

      puts 'Starting skill embedding generation...'
      puts "Ignore existing embeddings: #{ignore_existing}"

      skills_query = Skill.all
      skills_query = skills_query.without_embeddings unless ignore_existing

      total_skills = skills_query.count
      puts "Found #{total_skills} skills to process"

      if total_skills.zero?
        puts 'No skills to process. All skills already have embeddings.'
        exit
      end

      generate_embedding = Skills::GenerateEmbedding.new(skills_query)

      total_completed = 0
      generate_embedding.
        on(:ok) do
          puts "\nCompleted!"
          puts "Successfully processed: #{total_skills} skills."
        end.
        on(:error) do |error_message|
          puts "✗ Failed to process embeddings: #{error_message}"
        end.
        on(:update) do |res|
          total_completed += res[:size] || 0
          puts "Progress: #{total_completed}/#{total_skills} skills completed"
        end.
        call
    end
  end
end
