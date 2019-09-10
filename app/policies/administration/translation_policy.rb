# frozen_string_literal: true

module Administration
  class TranslationPolicy < Administration::BasePolicy
    def new?
      import?
    end

    def export?
      @user.is?(:superadmin) || @user.has_grant?(:translations, :export)
    end

    def import?
      @user.is?(:superadmin) || @user.has_grant?(:translations, :import)
    end
  end
end
