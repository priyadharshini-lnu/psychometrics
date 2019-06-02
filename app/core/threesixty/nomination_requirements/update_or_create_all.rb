module Threesixty
  module NominationRequirements
    class UpdateOrCreateAll < BaseCommand
      attr_reader :threesixty_campaign, :nomination_requirements

      def initialize(threesixty_campaign, nomination_requirements)
        @threesixty_campaign = threesixty_campaign
        @nomination_requirements = nomination_requirements
      end

      def call
        nomination_requirements.each do |nomination_requirement|
          form = Threesixty::NominationRequirements::Form.from_params(nomination_requirement)
          if form.persisted?
            nomination_requirement = Threesixty::NominationRequirement.find(form.id)
            nomination_requirement.update!(form.attributes)
          else
            threesixty_campaign.nomination_requirements.create!(form.attributes)
          end
        end
      end
    end
  end
end
