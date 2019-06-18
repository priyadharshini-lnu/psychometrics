# frozen_string_literal: true

module Threesixty
  module InstructionTemplates
    class Load < BaseCommand
      def initialize(campaign)
        @campaign = campaign
      end

      def call
        instruction_templates = read_yaml.map do |attributes|
          campaign.instruction_templates.new(attributes)
        end
        ::Threesixty::InstructionTemplate.import(instruction_templates)
      end

      private

      attr_reader :campaign

      def read_yaml
        YAML.load(ERB.new(File.read("#{Rails.root}/config/threesixty/instruction_template.yml")).result)
      end
    end
  end
end
