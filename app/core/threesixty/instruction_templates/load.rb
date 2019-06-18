# frozen_string_literal: true

module Threesixty
  module InstructionTemplates
    class Load < BaseCommand
      def initialize(threesixty_campaign)
        @threesixty_campaign = threesixty_campaign
      end

      def call
        instruction_templates = read_yaml.map do |attributes|
          threesixty_campaign.instruction_templates.new(attributes)
        end
        ::Threesixty::InstructionTemplate.import(instruction_templates)
      end

      private

      attr_reader :threesixty_campaign

      def read_yaml
        YAML.load(ERB.new(File.read("#{Rails.root}/config/threesixty/instruction_template.yml")).result)
      end
    end
  end
end
