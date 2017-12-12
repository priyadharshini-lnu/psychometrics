module Services
  module Communications
    class CheckByLevelStack
      include Interactor

      before :set_instances

      def call
        stop_client_stack_search = false
        @client_stack_ids.each do |client_id|
          break if stop_client_stack_search
          @communications.where(end_level_id: client_id).find_each(batch_size: 100) do |communication|
            if communication.selected_memberships.include?(@membership)
              communication.emails.create(membership: @membership)
              stop_client_stack_search = true
            end
          end
        end
      end

      private

      def set_instances
        @membership = context.membership
        @client_stack_ids = @membership.client.path_ids.reverse
        @communications = context.communications
      end
    end
  end
end
