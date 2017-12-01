module Services
  module Communications
    class DeliverInvitationEmails
      include Interactor
      def call
        if context.delay
          CommunicationEmailMailer.create(context.email_id).deliver_later(wait_until: context.delay)
        else
          CommunicationEmailMailer.create(context.email_id).deliver_later
        end
      end
    end
  end
end
