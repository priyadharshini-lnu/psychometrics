# frozen_string_literal: true

class Api::V2::Projects::Schema < Api::Base::Schema
  def self.resource
    'projects'
  end

  def self.attributes(attribute, _)
    proc do
      optional(:disabled).maybe(:bool)
      attribute[:name].filled(:string)
      attribute[:number].filled(:string)
      attribute[:subdomain].filled(:string)
      optional(:ancestry).filled(:string)
      optional(:client_id).filled(:string)
      optional(:logo).maybe(:string)
      optional(:locales).array(:string)
      optional(:enable_live_chat).maybe(:bool)
      optional(:campaign_dashboard_instructions).maybe(:string)
      optional(:locale).maybe(:string)
    end
  end
end
