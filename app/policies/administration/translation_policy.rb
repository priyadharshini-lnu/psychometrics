# frozen_string_literal: true

module Administration
  class TranslationPolicy < Administration::BasePolicy
    def new?
      import?
    end

    def export?
      @user.has_grant?(:assessments, :manage)
    end

    def import?
      @user.has_grant?(:assessments, :manage)
    end
  end
end
