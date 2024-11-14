# frozen_string_literal: true

module Administration
  class IndividualDashboardSerializer < ::UserReportSerializer
    def user
      UserWithAllFieldsSerializer.new(
        context: {
          campaign: campaign
        }
      ).serialize(object.user)
    end
  end
end
