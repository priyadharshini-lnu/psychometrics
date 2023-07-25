# frozen_string_literal: true

module WorkshopInvites
  class CreateTranslations < BaseCommand
    def initialize(workshop_invite, translations)
      @workshop_invite = workshop_invite
      @translations_data = translations || []
    end

    def call
      @translations_data.map do |translation|
        Mobility.with_locale(translation[:locale]) do
          @workshop_invite.title = translation[:title]
          @workshop_invite.description = translation[:description]
        end
      end
      @workshop_invite.save!
    end
  end
end
