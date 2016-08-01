module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_administrator

    def connect
      self.current_administrator = find_verified_administrator
      logger.add_tags current_administrator.email
    end

    protected

    def find_verified_administrator
      verified_user = User.find_by_id(cookies.signed['administrator.id'])
      if verified_user && cookies.signed['administrator.expires_at'] &&
         cookies.signed['administrator.expires_at'] > Time.now
        verified_user
      else
        reject_unauthorized_connection
      end
    end
  end
end
