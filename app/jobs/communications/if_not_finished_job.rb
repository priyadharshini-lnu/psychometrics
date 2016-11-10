module Communications
  class IfNotFinishedJob < Communications::IfNotStartedJob
    def communication_scope
      Communication.enabled.delivery_if_not_finished
    end
  end
end
