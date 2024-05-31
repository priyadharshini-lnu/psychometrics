# frozen_string_literal: true

module Administration
  class BulkReportPolicy < Administration::BasePolicy
    def download?
      user.is?(:superadmin) || record.user_id == user.id
    end
  end
end
