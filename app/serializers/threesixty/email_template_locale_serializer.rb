# frozen_string_literal: true

module Threesixty
  class EmailTemplateLocaleSerializer < ActiveModel::Serializer
    attributes :id, :locale, :subject, :content
    def locale
      instance_options[:locale]
    end
  end
end
