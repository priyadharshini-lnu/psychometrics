# Prompt Templating

We use liquid templating to parse prompt. This allows us to create dynamic prompts based on the campaign context.

Ref: https://shopify.github.io/liquid/basics/introduction/

## Available Drops

### User Drop

Access current user information:

- `user.full_name` - User's full name
- `user.first_name` - User's first name
- `user.last_name` - User's last name
- `user.age` - User's age
- `user.gender` - User's gender
- `user.locale` - User's locale e.g. 'en-US', 'ar'. If no value is set, defaults to 'en'
- `user.email` - User's email address
- `user.language` - User's language (localized), e.g. 'English', 'Arabic'. If no value is set, defaults to 'English'

### Campaign Drop

Access campaign information:

- `campaign.id` - Campaign ID
- `campaign.name` - Campaign name
- `campaign.description` - Campaign description
- `campaign.type` - Campaign type

### Campaign User Drop

Access campaign user relationship information:

- `campaign_user.level` - User's level in the campaign (apply/guide/shape)

### Campaign Factors Drop

Access campaign factors by code or iterate through all:

- `campaign_factors.{code}.name` - Factor name
- `campaign_factors.{code}.description` - Factor description
- `campaign_factors.{code}.output_type` - Factor output type (numeric/string)
- `campaign_factors.{code}.factor_type` - Factor type
- `campaign_factors.{code}.position` - Factor position
- `campaign_factors.{code}.value` - Factor value (numeric_value || string_value)
- `campaign_factors.{code}.numeric_value` - Numeric value if available
- `campaign_factors.{code}.string_value` - String value if available

#### Filtering Campaign Factors

You can filter campaign factors using the following liquid filters:

- `campaign_factors | campaign_factors_by_group: 'Group Name'` - Filter by campaign factor group name
- `campaign_factors | campaign_factors_by_codes: 'code1,code2,code3'` - Filter by specific codes (comma-separated)

All filters return arrays that work seamlessly with Liquid's built-in filters and loops.

## Example Usage

### Basic User Template

```ruby
user = User.find_by(email: 'sritabh@example.com')

prompt = "Hi {{user.first_name}} {{user.last_name}}! Your age is {{user.age}}."

AI::PromptTemplate::Renderer.call!(prompt, user: user)
```

### Campaign User Template

```ruby
user = User.find(5)
campaign = Campaign.find(1)

prompt = "User: {{user.full_name}}, Level: {{campaign_user.level}}"

AI::PromptTemplate::Renderer.call!(prompt, user: user, campaign: campaign)
```

### Campaign Factors Template

```ruby
user = User.find(36094)
campaign = Campaign.find(11165)

prompt = <<~PROMPT
  User: {{user.first_name}} {{user.last_name}}
  Factor: {{campaign_factors.innovation_explorer.name}}
  Description: {{campaign_factors.innovation_explorer.description}}
  Type: {{campaign_factors.innovation_explorer.output_type}}
  Score: {{campaign_factors.innovation_explorer.value}}
PROMPT

AI::PromptTemplate::Renderer.call!(prompt, user: user, campaign: campaign)
```

### Advanced usage

#### Filter by Campaign Factor Group

```ruby
user = User.find(36094)
campaign = Campaign.find(11165)

prompt = <<~PROMPT
  User: {{user.first_name}} {{user.last_name}}

  Assessment Center Factors:
  {% assign group_factors = campaign_factors | campaign_factors_by_group: 'Assessment Center' %}
  {% for factor in group_factors %}
  - {{factor.name}}: {{factor.description}} (Score: {{factor.value}})
  {% endfor %}
PROMPT

AI::PromptTemplate::Renderer.call!(prompt, user: user, campaign: campaign)
```

#### Filter by Specific Codes

```ruby
user = User.find(36094)
campaign = Campaign.find(11165)

prompt = <<~PROMPT
  User: {{user.first_name}} {{user.last_name}}

  Key Leadership Factors:
  {% assign target_codes = "innovation_explorer,results_driver" %}
  {% assign filtered_factors = campaign_factors | campaign_factors_by_codes: target_codes %}
  {% for factor in filtered_factors %}
  - {{factor.name}}: {{factor.description}} (Score: {{factor.value}})
  {% endfor %}
PROMPT

AI::PromptTemplate::Renderer.call!(prompt, user: user, campaign: campaign)
```

#### Get top/bottom scoring factors

```ruby
user = User.find(36094)
campaign = Campaign.find(11165)

prompt = <<~PROMPT
  You're MTE assistant responsible for giving career advice to user based on their scoring, for low scores assistant would suggest one liner for improvement and for strong score suggest to keep doing. The scores are out of 10.

  The user is {{user.full_name}}

  The top 3 leadership factors are:
  {% assign sorted_factors_desc = campaign_factors | sort: 'value' | reverse %}
  {% for factor in sorted_factors_desc limit:3 %}
  - {{factor.name}}: {{factor.description}} (Score: {{factor.value}})
  {% endfor %}

  The bottom 3 leadership factors are:
  {% assign sorted_factors_asc = campaign_factors | sort: 'value' %}
  {% for factor in sorted_factors_asc limit:3 %}
  - {{factor.name}}: {{factor.description}} (Score: {{factor.value}})
  {% endfor %}

  Please generate the insights in {{user.language}} language.
PROMPT

puts "="*60
puts AI::PromptTemplate::Renderer.call!(prompt, user: user, campaign: campaign)
puts "="*60
```
