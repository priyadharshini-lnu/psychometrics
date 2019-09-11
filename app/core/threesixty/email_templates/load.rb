# frozen_string_literal: true

module Threesixty
  module EmailTemplates
    class Load < BaseCommand
      def initialize(threesixty_campaign)
        @threesixty_campaign = threesixty_campaign
      end

      def call
        email_templates = read_yaml.map do |attributes|
          threesixty_campaign.email_templates.new(attributes)
        end
        ::Threesixty::EmailTemplate.import(email_templates)
      end

      private

      attr_reader :threesixty_campaign

      def read_yaml
        YAML.safe_load(ERB.new(File.read("#{Rails.root}/config/threesixty/email_templates.yml")).result)
      end
    end
  end
end
