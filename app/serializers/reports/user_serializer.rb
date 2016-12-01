module Reports
  class UserSerializer < ActiveModel::Serializer
    attributes :id, :first_name, :last_name, :email, :status, :completed_at

    def user_id
      object.user_id
    end

    def completed_at
      I18n.l(@instance_options[:assign].completed_at, format: :short) if @instance_options[:assign].completed_at
    end

    def status
      @instance_options[:assign].status
    end
  end
end
