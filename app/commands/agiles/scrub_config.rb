# frozen_string_literal: true

module Agiles
  class ScrubConfig < BaseCommand
    private_attr_accessor :config

    def initialize(config)
      @config = config
    end

    def call
      groups = pick_random_question_set(config['groups'])
      groups = scrub_keys(groups)
      broadcast(:ok, groups)
    end

    private

    # Removes `answers` from questions and `scoring` from blocks of Assessment scenes
    def scrub_keys(groups)
      iterate_blocks(groups) do |block|
        block.delete('scoring')
        questions = block.dig('questions')
        questions.each { |q| q.except!('answers', 'scoring') }
      end
    end

    def pick_random_question_set(groups)
      random_set = nil
      iterate_blocks(groups) do |block|
        random_sets = Set.new
        questions = block.dig('questions')
        questions.each do |q|
          q['randomSet'] ||= 1
          random_sets.add q['randomSet']
        end
        # Retain previous set if exists in block
        random_set = random_sets.include?(random_set) ? random_set : random_sets.to_a.sample
        questions.select! { |q| q['randomSet'] == random_set }
      end
    end

    def iterate_blocks(groups)
      groups.tap do |original_groups|
        original_groups.each do |group|
          group['scenes'].select { |scene| scene['type'] == 'AssessmentScene' }.each do |scene|
            blocks = scene.dig('data', 'blocks')
            blocks.each do |block|
              yield block
            end
          end
        end
      end
    end
  end
end
