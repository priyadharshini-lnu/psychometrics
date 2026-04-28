# frozen_string_literal: true

module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      self.current_user = find_verified_administrator
      logger.push_tags(current_user.email) unless logger.tags.include?(current_user.email)
    end

    protected

    def find_verified_administrator
      user_id = request.session['user.id']
      verified_user = User.find_by(id: user_id) if user_id
      verified_user ||= Users::AuthenticateAnonymousUser.call!(cookies)
      verified_user || reject_unauthorized_connection
    end
  end
end
