# frozen_string_literal: true

module Administration
  class IndividualDashboardSerializer < ::UserReportSerializer
    def user
      UserWithAllFieldsSerializer.new(object.user).to_h
    end
  end
end
