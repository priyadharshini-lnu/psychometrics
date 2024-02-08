# frozen_string_literal: true

module Administration
  class IndividualDashboardSerializer < ::UserReportSerializer
    has_one :user, method: :user_with_all_fields

    def user_with_all_fields
      UserWithAllFieldsSerializer.new(object.user)
    end
  end
end
