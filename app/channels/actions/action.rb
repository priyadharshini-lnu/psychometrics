module Actions
  module Action
    def action(action_name, &block)

      action_name = "#{name.downcase.split('::').last}_#{action_name}"
      # Rails.logger.warn "self.assessment #{current_administrator}"
      define_method action_name do |data|
        Rails.logger.warn "server #{current_administrator} #{params.inspect}"
        begin
          response = block.call(data) || {}
          response.merge!({
              type: 'success',
              notification: { level: 'success', message: I18n.t("administration.cable.notification.#{action_name}") },
              action: action_name,
              request_id: data['request_id']
          })
          transmit(response)
        rescue Exception => e
          # add success of error
          Rails.logger.error("#{e.message}\n")
          Rails.logger.error(e.backtrace.join("\n"))
          transmit(notification: { level: 'error', message: e.message }, 'action': action_name, type: 'error')
        end
      end
    end
  end
end