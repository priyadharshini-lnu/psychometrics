# frozen_string_literal: true

module Threesixty
  module NominationRequirements
    class FindForUsers < BaseCommand
      attr_reader :users, :threesixty_campaign, :campaign, :subject_conditions

      def initialize(users, threesixty_campaign)
        @users = Array.wrap(users)
        @threesixty_campaign = threesixty_campaign
        @campaign = threesixty_campaign.campaign
      end

      def call
        result = users.each_with_object({}) do |user, res|
          res[user.id] =
            nomination_requirements.find do |n|
              Threesixty::NestedConditionResolver.call!(n.subject_conditions, proc { |condition|
                                                                                resolve_condition(condition, user.email)
                                                                              })
            end
        end
        broadcast :ok, result
      end

      def resolve_condition(condition, email)
        field = condition['field']
        value = condition['value']&.downcase
        value_from_datasheet = datasheet_data_indexed_by_email.dig(email, field).to_s.downcase
        result =
          if condition['comparator'] == 'equal'
            value_from_datasheet == value
          else
            value_from_datasheet != value
          end

        { operator: condition['operator'], result: result }
      end

      private

      def datasheet_data_indexed_by_email
        @datasheet_data_indexed_by_email ||= ::Campaigns::GetDatasheetData.call!(campaign, users.map(&:email))
      end

      def nomination_requirements
        @nomination_requirements ||= threesixty_campaign.nomination_requirements.order(:position)
      end
    end
  end
end
