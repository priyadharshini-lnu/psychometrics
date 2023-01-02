# frozen_string_literal: true

module PowerBi
  class CreateGroupAndAttachCapacityJob < ApplicationJob
    def perform(project, capacity_id)
      PowerBi::CreateGroup.call!(project) do
        on(:ok) do |res|
          PowerBi::AddGroupToCapacity.call!(res['id'], capacity_id)
          project.create_power_bi_setting(workspace_id: res['id'], capacity_id: capacity_id)
        end
      end
    end
  end
end
