# frozen_string_literal: true

module Users
  class SuperAdmin < User
    def scope
      :administration
    end
  end
end
