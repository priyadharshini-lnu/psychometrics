# frozen_string_literal: true

module Threesixty
  class InstructionTemplateLocaleSerializer < Panko::Serializer
    attributes :id, :locale, :content

    def locale
      context[:locale]
    end
  end
end
