# frozen_string_literal: true

# rubocop:disable Style/NonNilCheck
module Campaigns
  class NormalizeAPIRequest < BaseCommand
    private_attr_accessor :params

    def initialize(params)
      @params = params.to_h
    end

    def call
      res = params.clone
      res['campaign_options_attributes'] = {}
      res['type'] = :common
      res['campaign_options_attributes']['fixed_time'] = res.delete 'fixed_time' unless res['fixed_time'].nil?
      res['campaign_options_attributes']['fixed_time_duration'] = res.delete 'duration' unless res['duration'].nil?
      res['campaign_options_attributes']['instructions'] = res.delete 'instructions' unless res['instructions'].nil?
      unless res['enable_instructions'].nil?
        res['campaign_options_attributes']['instructions_enabled'] = res.delete 'enable_instructions'
      end

      broadcast :ok, res
    end
  end
end
# rubocop:enable Style/NonNilCheck
