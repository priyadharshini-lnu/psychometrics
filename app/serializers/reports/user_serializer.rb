module Reports
  class UserSerializer < ActiveModel::Serializer
    attributes :id, :first_name, :last_name, :email, :status, :completed_at
    def id
      object.user_id
    end

    def completed_at
      @instance_options[:assign]&.completed_at&.strftime('%d %b %Y')
    end

    def status
      @instance_options[:assign].status
    end
  end
end
