# frozen_string_literal: true

module Threesixty
  class InstructionTemplateLocaleSerializer < ActiveModel::Serializer
    attributes :id, :locale, :content

    def locale
      instance_options[:locale]
    end
  end
end
