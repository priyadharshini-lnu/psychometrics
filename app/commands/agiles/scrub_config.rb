# frozen_string_literal: true

module Agiles
  class ScrubConfig < BaseCommand
    private_attr_accessor :config

    def initialize(config)
      @config = config
    end

    def call
      broadcast(:ok, scrub_keys)
    end

    private

    # Removes `answers` from questions and `scoring` from blocks of Assessment scenes
    def scrub_keys
      groups = config['groups']
      groups.tap do |original_groups|
        original_groups.reject { |group| group['id'] == 'intro-group' }.each do |group|
          group['scenes'].select { |scene| scene['type'] == 'AssessmentScene' }.each do |scene|
            blocks = scene.dig('data', 'blocks')
            blocks.each do |block|
              block.delete('scoring')
              questions = block.dig('questions')
              questions.each { |q| q.delete('answers') }
            end
          end
        end
      end
    end
  end
end
