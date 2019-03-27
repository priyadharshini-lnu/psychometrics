module Assessments
  module Actions
    module Geo
      extend Actions::Action

      ###
      # data['column'] - column that will be filtering
      # data['q'] - query filter
      ###
      action :filter do |data, _current_user, _assessment|
        geo = ::Datas::Geo.
                select(data['column']).
                where("#{::Datas::Geo.connection.quote_column_name(data['column'])} ILIKE ?", "#{data['q']}%").
                group(data['column']).
                limit(10)
        geo.map { |g| { value: g.value(data['column']), label: g.value(data['column']) } }
      end
    end
  end
end
