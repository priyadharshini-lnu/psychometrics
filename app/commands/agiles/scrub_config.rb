# frozen_string_literal: true

module Agiles
  class ScrubConfig < BaseCommand
    private_attr_accessor :config, :seedrandom

    def initialize(config, seedrandom)
      @config = config
      @seedrandom = Random.new(seedrandom)
    end

    def call
      groups = pick_random_question_set(config['groups'])
      groups = scrub_keys(groups)
      broadcast(:ok, groups)
    end

    private

    # Removes `answers` from questions and `scoring` from blocks of Assessment scenes
    def scrub_keys(groups)
      iterate_blocks(groups, ['AssessmentScene']) do |block, _|
        block.delete('scoring')
        block.delete('randomise')
        block.delete('maxItems')
        questions = block['questions']
        questions.each { |q| q.except!('answers', 'scoring') }
      end
    end

    def pick_random_question_set(groups)
      random_set = nil
      prev_group = nil
      iterate_blocks(groups, %w[PracticeScene AssessmentScene]) do |block, group|
        random_set = nil if group != prev_group
        prev_group = group
        random_sets = Set.new
        questions = block['questions']
        questions.each do |q|
          q['randomSet'] ||= 1
          random_sets.add q['randomSet']
        end
        # Retain previous set if exists in block
        random_set = random_sets.to_a.sample(random: @seedrandom) unless random_sets.include?(random_set)
        questions.select! { |q| q['randomSet'] == random_set }
        questions.shuffle!(random: @seedrandom) if block['randomise']
        questions.slice!(block['maxItems']..-1) if block['maxItems']
      end
    end

    def iterate_blocks(groups, scene_types)
      groups.tap do |original_groups|
        original_groups.each do |group|
          group['scenes'].select { |scene| scene_types.include?(scene['type']) }.each do |scene|
            blocks = scene.dig('data', 'blocks')
            blocks.each do |block|
              yield(block, group)
            end
          end
        end
      end
    end
  end
end
