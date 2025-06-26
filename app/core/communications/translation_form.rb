# frozen_string_literal: true

module Communications
  class TranslationForm < Rectify::Form
    attribute :subject, String
    attribute :body, String
    attribute :locale, String

    validates :subject, presence: true
    validates :body, presence: true
    validates :locale, inclusion: { in: I18n.available_locales.map(&:to_s) }

    def persist!
      return false unless valid?

      Mobility.with_locale(locale) do
        context.communication.update(attributes.except(:locale))
      end
    end
  end
end
