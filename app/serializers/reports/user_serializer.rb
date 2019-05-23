module Reports
  class UserSerializer < ActiveModel::Serializer
    attributes :id, :first_name, :last_name, :email, :status, :completed_at
    def id
      object.user_id
    end

    def status
      @instance_options[:assign].status
    end

    # Using for Piped Text
    def completed_at
      return if @instance_options[:assigns].blank?

      dates = @instance_options[:assigns].map do |assign|
        assign&.completed_at&.to_date
      end.compact.sort
      
      return '' if dates.empty?

      if dates.first == dates.last
        dates.first.strftime(I18n.t('time.formats.short_date'))
      else
        "#{dates.first.strftime(I18n.t('time.formats.short_date'))} - #{dates.last.strftime(I18n.t('time.formats.short_date'))}"
      end
    end
  end
end
