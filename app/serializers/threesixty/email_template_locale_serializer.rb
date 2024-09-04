# frozen_string_literal: true

module Threesixty
  class EmailTemplateLocaleSerializer < Panko::Serializer
    attributes :id, :locale, :subject, :content

    def locale
      context[:locale]
    end
  end
end
