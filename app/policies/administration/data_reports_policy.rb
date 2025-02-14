# frozen_string_literal: true

module Administration
  class DataReportsPolicy < Administration::BasePolicy
    def download?
      user.is?(:superadmin)
    end
  end
end
