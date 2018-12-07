# Is used for active record store https://api.rubyonrails.org/classes/ActiveRecord/Store.html
# Default coders dont allow to store json as is. They stored JSON as string. e.g. "{\"icon_color\":\"#e62a8f\"}"
# This serializer allows to store json as is. e.g. {"icon_color": "#db26be"}
class JsonSerializer
  def self.load(json)
    json
  end
  def self.dump(obj)
      obj
  end
end
