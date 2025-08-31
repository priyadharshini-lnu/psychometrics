# frozen_string_literal: true

module WorkshopInvites
  class UpdateTranslations < BaseCommand
    def initialize(workshop_invite, translations)
      @workshop_invite = workshop_invite
      @translations_data = translations || []
    end

    def call
      current_locales = @workshop_invite.translations.pluck(:locale).map(&:to_s)

      new_locales = @translations_data.map { |t| t[:locale].to_s }

      locales_to_remove = current_locales - new_locales

      @workshop_invite.translations.where(locale: locales_to_remove).destroy_all

      @translations_data.each do |translation|
        Mobility.with_locale(translation[:locale]) do
          @workshop_invite.title = translation[:title]
          @workshop_invite.description = translation[:description]
        end
      end

      @workshop_invite.save!
    end
  end
end
