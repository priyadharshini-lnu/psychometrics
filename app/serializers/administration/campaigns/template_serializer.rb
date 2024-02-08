# frozen_string_literal: true

module Administration
  module Campaigns
    class TemplateSerializer < Panko::Serializer
      attributes :id, :name, :assessment_id
    end
  end
end
