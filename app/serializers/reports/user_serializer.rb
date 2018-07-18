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
      return if @instance_options[:assigns].blank?
      @instance_options[:assigns].map do |assign|
        assign&.completed_at&.strftime('%d %b %Y')
      end.compact.join(', ')
    end

    # Using for Piped Text
    def norm_used
      norm_data = @instance_options[:assigns].pluck(:norm_data).compact
      return if norm_data.blank?
      norms = Norm.where(id: norm_data.map { |data| data.dig('id') }.compact)
      norms.map do |norm|
        norm&.decorate&.display_name
      end
    end
  end
end
