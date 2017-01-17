module Reports
  class UserSerializer < ActiveModel::Serializer
    attributes :id, :first_name, :last_name, :email, :status, :completed_at, :norm_used
    def id
      object.user_id
    end

    def status
      @instance_options[:assign].status
    end

    # Using for Piped Text
    def completed_at
      @instance_options[:assign]&.completed_at&.strftime('%d %b %Y')
    end

    # Using for Piped Text
    def norm_used
      norm_data = @instance_options[:assign]&.norm_data
      return nil if norm_data.blank?
      norm = Norm.find_by(id: norm_data.try(:[], 'id'))
      norm&.decorate&.display_name
    end
  end
end
