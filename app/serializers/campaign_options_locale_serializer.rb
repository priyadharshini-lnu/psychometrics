# frozen_string_literal: true

class CampaignOptionsLocaleSerializer < ActiveModel::Serializer
  attributes :instructions, :locale

  def locale
    instance_options[:locale]
  end
end
