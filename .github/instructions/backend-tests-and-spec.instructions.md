---
applyTo: 'spec/**/*.rb'
---

# Writing spec instruction
When writing tests for classes, unless specified, only test the public methods. Never be verbose, we need to test the important functionality. No need to write tests for private method calls. The private method calls should be tested indirectly by calling public methods. Avoid mocking of such things instead create data that can be manupulated.

## Using comments
A spec with descirption should

### Adding test which uses these command class
Always use `stub_wisper_publisher`

Example
```
stub_wisper_publisher('AI::CampaignArtifacts::ResultGenerator', :call, :ok, results)
```
```
stub_wisper_publisher('AI::CampaignArtifacts::ResultGenerator', :call, :error, error)
```

### Running spec
We need to always use DISABLE_SPRING=1 when running a spec e.g
```bash
DISABLE_SPRING=1 bundle exec rspec spec/path_to_spec.rb
```

# Dealing with command class
When calling a a service class which is inherited from BaseCommand remember it can be directly called with .call method. No need to create instance and then call call method.

### Example

```ruby
class MyService < BaseCommand
  def initialize(param1, param2)
    @param1 = param1
    @param2 = param2
  end

  def call
    # business logic here
    return broadcast(:error, error) if error_condition_met?
    broadcast(:ok, result)
  end
end
```

We can call the service like

```ruby

# First approach
res = MyService.call(param1, param2)

result = res[:ok] # will be nil if there was an error
error = res[:error] # empty if no error

# Second approach

result = MyService.call!(param1, param2) # will return result from braodcast(:ok, result)

```


Another way to call is
```ruby
instance = MyService.new(param1, param2)

instance.on(:ok) do |result|
  # handle success
end.
on(:error) do |error|
  # handle error
end.
call
```
