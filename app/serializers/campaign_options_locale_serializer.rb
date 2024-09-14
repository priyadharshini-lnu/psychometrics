# frozen_string_literal: true

class CampaignOptionsLocaleSerializer < Panko::Serializer
  attributes :instructions, :locale

  def locale
    context[:locale]
  end
end
