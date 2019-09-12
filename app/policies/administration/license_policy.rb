# frozen_string_literal: true

module Administration
  class LicensePolicy < Administration::BasePolicy
    def overview?
      show?
    end
  end
end
