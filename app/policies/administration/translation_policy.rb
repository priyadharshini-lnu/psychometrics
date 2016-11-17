module Administration
  class TranslationPolicy < Administration::BasePolicy
    def export?
      @user.is?(:superadmin)
    end

    def import?
      @user.is?(:superadmin)
    end
  end
end
