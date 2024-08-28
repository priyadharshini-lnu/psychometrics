# frozen_string_literal: true

module Threesixty
  module InstructionTemplates
    class Load < BaseCommand
      def initialize(threesixty_campaign, prev_campaign)
        @threesixty_campaign = threesixty_campaign
        @prev_campaign = prev_campaign
      end

      def call
        if prev_campaign
          prev_campaign.instruction_templates.each do |instruction_template|
            template = instruction_template.deep_clone(include: :translations)
            template.threesixty_campaign_id = threesixty_campaign.id
            template.save!
          end
        else
          instruction_templates = read_yaml.map do |attributes|
            threesixty_campaign.instruction_templates.new(attributes)
          end
          ::Threesixty::InstructionTemplate.import(instruction_templates, recursive: true)
        end
      end

      private

      attr_reader :threesixty_campaign, :prev_campaign

      def read_yaml
        YAML.safe_load(
          ERB.new(
            File.read(
              Rails.root.join('config/threesixty/instruction_template.yml')
            )
          ).result
        )
      end
    end
  end
end
