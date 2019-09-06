# frozen_string_literal: true

module Threesixty
  module NominationRequirements
    class SaveAll < BaseCommand
      attr_reader :threesixty_campaign, :form

      def initialize(threesixty_campaign, form)
        @threesixty_campaign = threesixty_campaign
        @form = form
      end

      def call
        ids = form.nomination_requirements.each_with_object([]) do |form, ids|
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
