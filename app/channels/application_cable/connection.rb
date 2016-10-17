module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      self.current_user = find_verified_administrator
      logger.add_tags current_user.email
    end

    protected

    def find_verified_administrator
      verified_user = User.find_by_id(cookies.signed['user.id'])
      if verified_user
        verified_user
      else
        reject_unauthorized_connection
      end
    end
  end
end
