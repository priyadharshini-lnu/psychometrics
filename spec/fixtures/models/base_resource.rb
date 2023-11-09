# frozen_string_literal: true

module Dummy
  class BaseResource < Api::V2::Administration::BaseResource
    abstract

    model_hint model: 'dummy/campaign', resource: :campaign

    def self.records(_options = {})
      _model_class.all
    end

    def self.records_for(relation_name)
      _model.public_send relation_name
    end
  end
end
