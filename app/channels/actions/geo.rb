module Actions
  module Geo
    extend Actions::Action

    ###
    # data['column'] - column that will be filtering
    # data['q'] - query filter
    ###
    action :filter do |data, _current_administrator, _assessment|
      geo = ::Data::Geo.
              select(data['column']).
              where("#{::Data::Geo.connection.quote_column_name(data['column'])} ILIKE ?", "#{data['q']}%").
              group(data['column']).
              limit(10)
      geo.map { |g| { value: g.value(data['column']), label: g.value(data['column']) } }
    end
  end
end
