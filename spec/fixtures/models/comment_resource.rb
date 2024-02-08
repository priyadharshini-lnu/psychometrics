# frozen_string_literal: true

module Dummy
  class CommentResource < Dummy::BaseResource
    model_name 'Dummy::Comment'

    attributes :comment

    has_one :post
  end
end
