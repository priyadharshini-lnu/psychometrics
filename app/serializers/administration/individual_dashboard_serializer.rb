# frozen_string_literal: true

module Administration
  class IndividualDashboardSerializer < ::UserReportSerializer
    has_one :user, serializer: UserWithAllFieldsSerializer
  end
end
