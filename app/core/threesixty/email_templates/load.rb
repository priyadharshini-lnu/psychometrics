# frozen_string_literal: true

module Threesixty
  module EmailTemplates
    class Load < BaseCommand
      def initialize(threesixty_campaign, prev_campaign)
        @threesixty_campaign = threesixty_campaign
        @prev_campaign = prev_campaign
      end

      def call
        if prev_campaign
          prev_campaign.email_templates.each do |email_template|
            template = threesixty_campaign.email_templates.create!(email_template.attributes.except('id'))
            email_template.translations.each do |transaction|
              template.translations.create!(transaction.attributes.except('id'))
            end
            template.save!
          end
        else
          email_templates = read_yaml.map do |attributes|
            threesixty_campaign.email_templates.new(attributes)
          end

          ::Threesixty::EmailTemplate.import(email_templates, recursive: true)
        end
      end

      private

      attr_reader :threesixty_campaign, :prev_campaign

      def read_yaml
        YAML.safe_load(
          ERB.new(
            File.read(
              Rails.root.join('config/threesixty/email_templates.yml')
            )
          ).result
        )
      end
    end
  end
end
