# frozen_string_literal: true

module API
  class NormalizeCampaignParams < BaseCommand
    private_attr_accessor :params

    def initialize(params)
      @params = params
    end

    def call
      if params[:campaigns].present? && params[:campaigns].is_a?(Array)
        params[:campaigns] = params[:campaigns].map do |campaign|
          campaign.merge(existing_record: normalize_existing_record(campaign[:existing_record]))
        end
        return broadcast :ok, params
      end

      params[:campaigns] = (params[:campaign_ids] || []).map do |id|
        {
          id: id,
          active: true,
          existing_record: 'add_and_allow_new_response'
        }
      end

      broadcast :ok, params
    end

    def normalize_existing_record(value)
      return 'add_with_existing_response' if value == 'copy_evaluation'
      return 'add_and_allow_new_response' if value == 'new_evaluation'

      value
    end
  end
end
