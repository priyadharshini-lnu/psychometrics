# frozen_string_literal: true

module Threesixty
  module EmailTemplates
    class Load < BaseCommand
      def initialize(campaign)
        @campaign = campaign
      end

      def call
        email_templates = read_yaml.map do |attributes|
          campaign.email_templates.new(attributes)
        end
        ::Threesixty::EmailTemplate.import(email_templates)
      end

      private

      attr_reader :campaign

      def read_yaml
        YAML.load(ERB.new(File.read("#{Rails.root}/config/threesixty/email_templates.yml")).result)
      end
    end
  end
end
