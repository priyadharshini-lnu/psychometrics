# frozen_string_literal: true

module PowerBi
  class AddGroupToCapacity < Base
    private_attr_reader :group_id, :capacity_id

    def initialize(group_id, capacity_id)
      @group_id = group_id
      @capacity_id = capacity_id
    end

    def call
      response = post("groups/#{group_id}/AssignToCapacity", { capacityId: capacity_id })

      if response.status != 200
        raise PowerBi::Errors::GroupAttachingToCapacityFailed,
              "Failed to attach group #{group_id} to capacity #{capacity_id}. Error: #{parsed_response}"
      end

      broadcast :ok
    end
  end
end
