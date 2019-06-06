# frozen_string_literal: true

module Threesixty
  module NominationRequirements
    class Save < BaseCommand
      attr_reader :threesixty_campaign, :nomination_requirements

      def initialize(threesixty_campaign, nomination_requirements)
        @threesixty_campaign = threesixty_campaign
        @nomination_requirements = nomination_requirements
      end

      def call
        ids = nomination_requirements.each_with_object([]) do |nomination_requirement, ids|
          form = Threesixty::NominationRequirements::Form.from_params(nomination_requirement)
          if form.persisted?
            nomination_requirement = threesixty_campaign.nomination_requirements.find(form.id)
            nomination_requirement.update!(form.attributes)
          else
            nomination_requirement = threesixty_campaign.nomination_requirements.create!(form.attributes)
          end
          ids << nomination_requirement.id
        end
        threesixty_campaign.nomination_requirements.where.not(id: ids).map(&:destroy!)
      end
    end
  end
end
