# frozen_string_literal: true

module Administration
  class IndividualDashboardSerializer < ::UserReportSerializer
    def user
      UserWithAllFieldsSerializer.new.serialize(object.user)
    end
  end
end
