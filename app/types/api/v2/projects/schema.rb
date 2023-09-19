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
      optional(:privacy_consent).maybe(:bool)
      optional(:custom_privacy_consent).maybe(:bool)
      optional(:custom_privacy_policy_version).maybe(:integer)
      optional(:custom_privacy_consent_texts).array(:hash) do
        required(:locale).filled(:string)
        required(:text).maybe(:string)
      end
      optional(:enable_live_chat).maybe(:bool)
      optional(:text).maybe(:string)
      optional(:link).maybe(:string)
      optional(:enable_privacy_link).maybe(:bool)
    end
  end
end
