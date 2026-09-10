# frozen_string_literal: true

module Administration
  class NavigationLinksSchema < BaseSchema
    def self.schema(_, _) # rubocop:disable Metrics/AbcSize
      Dry::Schema.JSON do # rubocop:disable Metrics/BlockLength
        config.validate_keys = true

        required(:links).hash do
          optional(:dashboards).filled(:str?)
          optional(:profileDetails).filled(:str?)
          optional(:profile).filled(:str?)
          optional(:changePassword).filled(:str?)
          optional(:assessorDashboard).filled(:str?)
          optional(:assessorWorkshops).filled(:str?)
          optional(:clients).filled(:str?)
          optional(:users).filled(:str?)
          optional(:norms).filled(:str?)
          optional(:dimensions).filled(:str?)
          optional(:assessments).filled(:str?)
          optional(:userAvailability).filled(:str?)
          optional(:questionCenter).filled(:str?)
          optional(:libraries).filled(:str?)
          optional(:communicationCenter).filled(:str?)
          optional(:newCommunicationCenter).filled(:str?)
          optional(:reports).filled(:str?)
          optional(:reportApprovals).filled(:str?)
          optional(:dataReports).filled(:str?)
          optional(:campaignTemplates).filled(:str?)
          optional(:auditLogs).filled(:str?)
          optional(:viewDataExports).filled(:str?)
          optional(:skillsTaxonomy).filled(:str?)
          optional(:developmentActions).filled(:str?)
          optional(:aiAssistants).filled(:str?)
        end
      end
    end
  end
end
